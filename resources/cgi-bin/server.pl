#! /usr/bin/perl -w
# "c:\xampp\perl\bin\perl.exe"

use strict;
use warnings;

use CGI;
use CGI::Carp qw(fatalsToBrowser);

use LWP::Simple;

use JSON;
use Data::Dumper;
use Encode;

use DBI;
use lib qw(/home/perl_libs);
use SQE_database; # ignore the error, former: require '/etc/access.pm';


# global variables

my $DBH; # database handler
my $CGI; # web (common gateway interface)


# helper functions

sub query($)
{
	my $sql_command = shift;
	if (index($sql_command, 'user_sessions') == -1)
	{
		print '$sql_command '.$sql_command.'\n';	
	}
	
	my $query = $DBH->prepare($sql_command) or die DBI->errstr;
	$query->execute() or die DBI->errstr;
	$query->finish();
}

sub queryResult($)
{
	my $sql_command = shift;
	
	my $query = $DBH->prepare($sql_command) or die DBI->errstr;
	$query->execute() or die DBI->errstr;
	
	my @row = $query->fetchrow_array();
	my $returnValue = $row[0];
	
	$query->finish();
	
	return $returnValue;
}

sub queryAll($)
{
	my $sql_command = shift;
	
	my $query = $DBH->prepare($sql_command);
	$query->execute();
	
	my @row;
	my @allResults;
	while (@row = $query->fetchrow_array())
	{
		push @allResults, @row;
	}
		
	$query->finish();
	return @allResults;
}

sub queryAllRows($)
{
	my $sql_command = shift;
	
	my $query = $DBH->prepare($sql_command);
	$query->execute();
	
	my @row;
	my %allRows = {};
	my $allRowsIndex = 0;
	
	while (@row = $query->fetchrow_array())
	{
		$allRows{$allRowsIndex} = @row;
		$allRowsIndex++;
	}
		
	$query->finish();
	return %allRows;
}

sub lastInsertedId()
{
	return queryResult
	(
		'SELECT LAST_INSERT_ID()'
	);
}

sub userId($)
{
	my $user_name = shift;
	
	my $user_id = queryResult
	(
		'SELECT user_id FROM user '
		.'WHERE user_name = "'.$user_name.'"'
	);
	
	return $user_id;
}


# functions related to client requests

sub login()
{
	my $user_name = $CGI->param('user');
	my $pw        = $CGI->param('password');
	
	my ($actual_pw, $user_id) = queryAll
	(
		'SELECT pw, user_id FROM user'
		.' WHERE user_name = "'.$user_name.'"'
	);
	
	# compare provided & actual password
	
	if ($actual_pw eq $pw)
	{
		my $query;
		
		# end previous session
		query
		(
			'UPDATE user_sessions'
			.' SET session_end = NOW(), current = false'
			.' WHERE user_id = '.$user_id.' AND current = true'
		);
		
		# start new session
		query
		(
			'INSERT INTO user_sessions (user_id, session_start, current)'
			.' VALUES ('.$user_id.', NOW(), true)'
		);
		my $session_id = lastInsertedId();
		
		# build random session key (needs session id first)
		my $session_key = int(rand(10000)).$session_id.int(rand(10000));
		# TODO improve security of key generation
		
		query
		(
			'UPDATE user_sessions'
			.' SET session_key = '.$session_key
			.' WHERE session_id = '.$session_id 
		);
		
		print $session_key;
	}
	else
	{
		print 0;
	}
}

sub logout()
{
	my $user_name = $CGI->param('user');
	my $user_id = userId($user_name);
	
	# end their session if one is running
	query
	(
		'UPDATE user_sessions '
		.'SET session_end = NOW()'
		.', current = false '
		.'WHERE user_id='.$user_id
		.' AND current = true'
	);
		
	print 1;
}

sub getManifest()
{
	my $url = $CGI->param('url');
	my $sou = get($url) or die "cannot retrieve code\n";
	
	print $sou;
}

sub saveMarkup()
{
	my $markup = $CGI->param('markup');
	my $user_name = $CGI->param('user');
	
	my $user_id = userId($user_name);
	if ($user_id == undef)
	{
		print 0;
	}
	else
	{
		query
		(
			'INSERT INTO user_contributions (user_id, contribution, entry_time) '
			.'VALUES ('.$user_id.',"'.$markup.'", now())'
		);
		
		print 1;
	}
}

sub saveToStream($$)
{
	my ($sign_id, $previous_pos_in_stream_id) = (shift, shift);
	
	query
	(
		'INSERT INTO position_in_stream '
		.'SET sign_id = '.$sign_id
	);
	my $current_pos_in_stream_id = lastInsertedId();
	
	if (defined $previous_pos_in_stream_id)
	{
		query
		(
			'INSERT INTO next_position_in_stream '
			.'SET position_in_stream_id = '.$previous_pos_in_stream_id
			.', next_position_in_stream_id = '.$current_pos_in_stream_id
		);
	}
	
	return $current_pos_in_stream_id;
}

sub saveBreak($$$)
{
	my ($break_type, $user_id, $previous_position_id) = (shift, shift, shift);
	
	query
	(
		'INSERT INTO sign '
		.'SET sign = "|"'
		.', sign_type_id = 9'
		.', break_type = "'.$break_type.'"'
	);
	my $sign_id = lastInsertedId();
		
	query
	(
		'INSERT INTO sign_owner '
		.'VALUES ('.$sign_id.', '.$user_id.', now())'
	);
	
	my $current_pos_in_stream_id = saveToStream
	(
		$sign_id,
		$previous_position_id
	);
	
	return ($sign_id, $current_pos_in_stream_id);
}

sub saveSigns()
{
	my $user_name = $CGI->param('user');
	my $user_id = userId($user_name);
	if ($user_id == undef)
	{
		print 'error: not logged in when saving signs';
		return;
	}
	
	my $input = $CGI->param('signs');
	print 'JSON: '.$input."\n";
	
	my $decoded = decode_json $input;
	
	my %signType2Id =
	(
		'space'				=> 2,
		'possibleVacat'		=> 3,
		'vacat'				=> 4,
		'damage'			=> 5,
		'blankLine'			=> 6,
		'paragraphMarker'	=> 7,
		'lacuna'			=> 8
	);
	my %signType2Char =
	(
		'space'			=> '" "',
		'possibleVacat'	=> '" "',
		'vacat'			=> '" "'
	);
	my %vocalization2Id =
	(
		'Tiberian'		=> 1,
		'Babylonian'	=> 2,
		'Palestinian'	=> 3
	);
	my %position2Enum =
	(
		'aboveLine'		=> 'ABOVE_LINE',
		'belowLine'		=> 'BELOW_LINE',
		'leftMargin'	=> 'LEFT_MARGIN',
		'rightMargin'	=> 'RIGHT_MARGIN'
	);
	my %correction2Enum =
	(
		'overwritten'		=> 'OVERWRITTEN',
		'horizontalLine'	=> 'HORIZONTAL_LINE',
		'diagonalLeftLine'	=> 'DIAGONAL_LEFT_LINE',
		'diagonalRightLine'	=> 'DIAGONAL_RIGHT_LINE',
		'dotBelow'			=> 'DOT_BELOW',
		'dotAbove'			=> 'DOT_ABOVE',
		'lineBelow'			=> 'LINE_BELOW',
		'lineAbove'			=> 'LINE_ABOVE',
		'boxed'				=> 'BOXED',
		'erased'			=> 'ERASED'
	);
	
	my @lines = @{$decoded};
	my $a;
	my $main_sign_id;
	my $position_level;
	my $scroll_id;
	
	# TODO break for scroll start, if fitting
	
	# TODO begin of input is probably not begin of column => check line tag first
	my ($previous_sign_id, $previous_stream_position_id)
	= saveBreak('COLUMN_START', $user_id, undef);
	
	foreach my $line (@lines) # TODO combine queries for all signs
	{
		# assume that line always starts with first sign
		($previous_sign_id, $previous_stream_position_id)
		= saveBreak('LINE_START', $user_id, $previous_stream_position_id);
		
		my @alternatives = @{$line};
		
		# no signs in this line => insert 'blank line' sign
		if (scalar @alternatives == 0)
		{
			@alternatives = ([{'sign' => 'blankLine'}]);
		}
		
		foreach my $alternative (@alternatives)
		{
			my $is_variant_sign = 0; # set to main sign
			
			my @signs = @{$alternative};
			foreach my $sign (@signs)
			{
				my %sign_entries = ();
				# assumed default values set by DB:
				# sign_type_id = 1, width = 1, might_be_wider = 0, vocalization_id = null
				# readability = null, readable_areas = (NW,NE,MW,ME,SW,SE)
				# is_reconstructed = 0, is_retraced = 0, deletion = null (not deleted)
				# form_of_writing_id = 0
				# editorial_flag = null
				# no commentary at sign_comment
				
				# transform from JSON to DB
				# TODO prohibit code injection
				
				my %attributes = %{$sign};
				
				if ($a = $attributes{'sign'})
				{
					if ($signType2Id{$a})
					{
						$sign_entries{'sign_type_id'} = $signType2Id{$a};
						
						if (my $char = $signType2Char{$a}) # space, vacat, possibleVacat -> single whitespace sign
						{
							$sign_entries{'sign'} = $char;
						}
					}
					elsif ($a =~ /[\x{05d0}-\x{05ea}]/) # Hebrew letter (context or final, but nothing special else)
					{
						# sign_type_id is already 1 (letter) by default
						$sign_entries{'sign'} = '\''.$a.'\''; # will remain empty string otherwise
					}
				}
				if ($a = $attributes{'width'})
				{
					if ($a =~ /[0-9]*(.[0-9]*)?/
					and $a > 0) # positive float
					{
						$sign_entries{'width'} = $a;
					}
				}
				if ($a = $attributes{'atLeast'})
				{
					if ($a eq 'true')
					{
						$sign_entries{'might_be_wider'} = 1;
					}
				}
				if ($a = $attributes{'vocalization'})
				{
					# TODO needs separate table, then usage of vocalization_id
					
					if ($vocalization2Id{$a})
					{
						# $sign_entries{'vocalization'} = $vocalization2Id{$a};
					}
				}
				
				if ($a = $attributes{'manuscript'})
				{
					$scroll_id = queryResult
					(
						'SELECT scroll_id FROM scroll WHERE name = "'
						.$a
						.'"'
					);
					# if null, connection to scroll will be ignored
					 
					# TODO restrict to scrolls the user has access to
					# TODO there might be multiple scrolls with the same name the user has access to
				}
				if ($a = $attributes{'fragment'}) # TODO evaluate, assume 1 otherwise?
				{
					$sign_entries{'fragment'} = $a;
				}
				if ($a = $attributes{'line'}) # TODO evaluate, assume 1 (and increasing) otherwise?
				{
					$sign_entries{'line'} = $a;
				}
				if ($a = $attributes{'scribe_id'})
				{
					if ($a =~ /[0-9]+/
					and $a > 0) # positive integer
					{
						# TODO add later
						# $sign_entries{'scribe_id'} = $a;
					}
				}
				
				if ($a = $attributes{'readability'}) # COMPLETE / INCOMPLETE_BUT_CLEAR / INCOMPLETE_AND_NOT_CLEAR
				{
					# TODO damaged: clear / unclear
				}
				if ($a = $attributes{'readable_areas'}) # set 'NW,NE,MW,ME,SW,SE'
				{
					# TODO
				}
				if ($a = $attributes{'reconstructed'})
				{
					if ($a eq 'true')
					{
						$sign_entries{'is_reconstructed'} = 1;	
					}
				}
				if ($a = $attributes{'retraced'})
				{
					if ($a eq 'true')
					{
						$sign_entries{'is_retraced'} = 1;	
					}
				}
				
				if ($a = $attributes{'suggested'})
				{
					if ($a eq '')
					{
						$sign_entries{'editorial_flag'} = '"SHOULD_BE_DELETED"';
					}
					elsif ($attributes{'sign'} eq '') # no sign to be read, but one suggested
					{
						$sign_entries{'sign'} = $a;
						$sign_entries{'editorial_flag'} = '"SHOULD_BE_ADDED"';
					}
					else
					{
						# TODO to alternative sign, link main sign and it
						$sign_entries{'editorial_flag'} = '"CONJECTURE"';
					}
				}
				
				print Dumper(%sign_entries);
				print '';
				
				# TODO check whether sign already exists (then only add it to the new user)
				
				# save sign itself
				my $sql_query = 'INSERT INTO sign SET ';
				while (my ($key, $value) = each %sign_entries)
				{
					$sql_query .= $key.'='.$value.','
				}
				$sql_query = substr($sql_query, 0, (length $sql_query) - 1); # remove final ,
				query
				(
					$sql_query
				);
				
				# get id for current sign, relevant for follow-up queries
				my $sign_id = lastInsertedId();
				
				# save sign owner
				query
				(
					'INSERT INTO sign_owner VALUES ('
					.$sign_id
					.','
					.$user_id
					.',now())'
				);
				
				# save position
				if ($a = $attributes{'position'})
				{
					$position_level = 1;
					
					while (my ($key, $value) = each %position2Enum)
					{
						if (index($a, $key) != -1)
						{
							query
							(
								'INSERT sign_relative_position SET sign_relative_position_id = '
								.$sign_id
								.', type = \''
								.$value
								.'\', level = '
								.$position_level
							);
							
							$position_level++;
						}
					}
				}
				
				# save correction
				if ($a = $attributes{'corrected'})
				{
					while (my ($key, $value) = each %correction2Enum)
					{
						if (index($a, $key) != -1)
						{
							query
							(
								'INSERT INTO sign_correction (sign_id, correction) VALUES ('
								.$sign_id
								.', \''
								.$value.'\')'
							); 
						}
					}
				}
				
				# save alternatives and stream position
				if ($is_variant_sign)
				{
					query
					(
						'INSERT INTO is_variant_sign_of VALUES ('
						.$main_sign_id
						.','
						.$sign_id
						.',1)'
					);
					
					# no direct link to sign stream, but indirectly via is_variant_sign_of
				}
				else # first sign of alternative (maybe the only one)
				{
					$previous_stream_position_id = saveToStream
					(
						$sign_id,
						$previous_stream_position_id
					);
					
					$main_sign_id = $sign_id;
					$is_variant_sign = 1; # for next signs of alternative (if existing)	
				}
				
				# save user's comment
				if ($a = $attributes{'comment'})
				{
					query # TODO later save in 1..n sign_comment table
					(
						'UPDATE sign'
						.' SET commentary = "'.$a.'"'
						.' WHERE sign_id = '.$sign_id
					);
				}
				
				# save connection to scroll
				if ($scroll_id != undef)
				{
					query
					(
						'INSERT real_area'
						.' SET scroll_id = '.$scroll_id
					);
					
					query
					(
						'UPDATE sign'
						.' SET real_areas_id = '.lastInsertedId()
						.' WHERE sign_id = '.$sign_id
					);
				}
				
				print 'saved to DB';
			}
		}
		
		($previous_sign_id, $previous_stream_position_id)
		= saveBreak('LINE_END', $user_id, $previous_stream_position_id);
	}
	
	saveBreak('COLUMN_END', $user_id, $previous_stream_position_id);
	
	# TODO break for scroll end, if fitting
}

sub getAllComments()
{
	my @comments = queryAll
	(
		'SELECT user_id, comment_text, entry_time FROM user_comment'
	);
	
	my $json_string = '[';
	for (my $i = 0; $i < scalar @comments - 2; $i += 3)
	{
		if ($i > 0)
		{
			$json_string .= ', ';
		}
		
		$json_string .= '{"name":"';
		$json_string .= queryResult
		(
			'SELECT user_name FROM user '
			.'WHERE user_id = "'.$comments[$i].'"'
		);
		$json_string .= '", ';
		
		$json_string .=
		'"comment":"'
		.$comments[$i + 1]
		.'", ';
		
		$json_string .=
		'"time":"'
		.$comments[$i + 2]
		.'"}';
	}
	$json_string .= ']';
	
	print $json_string;
}

sub saveComment()
{
	my $user_name = $CGI->param('user'   );	
	my $comment   = $CGI->param('comment');
	
	# get user id
	my $user_id = queryResult
	(
		'SELECT user_id FROM user '
		.'WHERE user_name = "'.$user_name.'"'
	);
	print '$user_id '."$user_id";
	
	# add comment to db
	query
	(
		'INSERT INTO user_comment (user_id, comment_text, entry_time) '
		.'VALUES '.'('.$user_id.', '.'"'.$comment.'", '.'NOW())'
	);
}

sub getAllContributions()
{
	my $user_name = $CGI->param('user');
	my ($actual_pw, $user_id) = queryAll
	(
		'SELECT pw, user_id FROM user '
		.'WHERE user_name = "'.$user_name.'"'
	);
	
	my @contributions = queryAll
	(
		'SELECT contribution_id, entry_time, contribution FROM user_contributions '
		.'WHERE user_id = '.$user_id
	);
	
	my $json_string = '[';
	for (my $i = 0; $i < scalar @contributions - 2; $i += 3)
	{
		if ($i > 0)
		{
			$json_string .= ', ';
		}
		
		$json_string .=
		'["'
		.$contributions[$i]
		.'","'
		.$contributions[$i + 1]
		.'","'
		.$contributions[$i + 2]
		.'"]';
	}
	$json_string .= ']';
	
	print $json_string;
}

sub deleteContribution()
{
	my $contribution_id = $CGI->param('contributionId');
	
	query
	(
		'DELETE FROM user_contributions '
		.'WHERE contribution_id = '.$contribution_id
	);
}

sub getAllResults()
{
	my $user_name = $CGI->param('user');
	my $user_id   = userId($user_name);
	
	my %id2SignType =
	(
		1 => 'letter',
		2 => 'space',
		3 => 'possibleVacat',
		4 => 'vacat',
		5 => 'damage',
		6 => 'blankLine',
		7 => 'paragraphMarker',
		8 => 'lacuna'
	);
	my %enum2position =
	(
		'ABOVE_LINE'	=> 'aboveLine',
		'BELOW_LINE'	=> 'belowLine',
		'LEFT_MARGIN'	=> 'leftMargin',
		'RIGHT_MARGIN'	=> 'rightMargin'
	);
	my %enum2correction =
	(
		'OVERWRITTEN'			=> 'overwritten',
		'HORIZONTAL_LINE'		=> 'horizontalLine',
		'DIAGONAL_LEFT_LINE'	=> 'diagonalLeftLine',
		'DIAGONAL_RIGHT_LINE'	=> 'diagonalRightLine',
		'DOT_BELOW'				=> 'dotBelow',
		'DOT_ABOVE'				=> 'dotAbove',
		'LINE_BELOW'			=> 'lineBelow',
		'LINE_ABOVE'			=> 'lineAbove',
		'BOXED'					=> 'boxed',
		'ERASED'				=> 'erased'
	);
	
	
	
	
	
	
	
	
	
	my %user_signs = queryAllRows # get all signs of this user
	(
		'SELECT * FROM sign '
		.'INNER JOIN sign_owner ON sign.user_id = sign_owner.owner_id '
		.'WHERE sign.user_id ='.$user_id
	);
	
	my @row;
	
	my %sign; # probably not needed, save directly into json?
	my @line; # same here
	
	my $json_string = '[';
	
	for (my $i = 0; $i < scalar %user_signs; $i++)
	{
		@row = @{$user_signs{$i}};
		
		%sign = {};
		
		if ($row[ 3] == 9
		&&  $row[15] == 'LINE_START')
		{
			# save line
			# 
		}
		
		# TODO line, fragment, manuscript
		# TODO use 'virtual scroll' tables
		
		# TODO extract if not default
		# date_of_adding
		# sign
		# type
		# width, might be wider
		# vocalization
		# readability & areas
		# is reconstructed
		# is retraced
		# form of writing (?)
		# editorial flag
		# commentary
		# break type (indirectly)
		# link to alternative signs?
		# corrections
		# relative position
		# owners 
		
		
	}
	
	$json_string .= ']';
	print $json_string;
}

# fetch request
$CGI = CGI->new;
my $request = $CGI->param('request');
if (!defined $request)
{
	print 'Undefined request (running from command line?)';
	$DBH = SQE_database::get_dbh;
	getAllComments();
	exit;
}
print $CGI->header('text/plain; charset=utf-8'); # support for Hebrew etc. characters


# connect to database
$DBH = SQE_database::get_dbh;

if ($request eq 'login')
{
	login();
}
elsif ($request eq 'logout')
{
	logout();
}
elsif ($request eq 'getManifest')
{
	getManifest();
}
elsif ($request eq 'saveMarkup')
{
	saveMarkup();
}
elsif ($request eq 'saveSigns')
{
	saveSigns();
}
elsif ($request eq 'getAllComments')
{
	getAllComments();
}
elsif ($request eq 'saveComment')
{
	saveComment();
}
elsif ($request eq 'getAllContributions')
{
	getAllContributions();
}
elsif ($request eq 'deleteContribution')
{
	deleteContribution();
}
elsif ($request eq 'getAllResults')
{
	getAllResults();
}

$DBH->disconnect();