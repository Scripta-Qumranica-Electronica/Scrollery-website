#! /usr/bin/perl -w
# c:\xampp\perl\bin\perl.exe -w

use strict;
use warnings;

use CGI;
use CGI::Carp qw(fatalsToBrowser);

use LWP::Simple;

use JSON;
use Data::Dumper;
use feature qw(say);
use Encode;

use DBI;
use lib qw(/home/perl_libs);
use SQE_database; # former: require '/etc/access.pm';


# global variables

my $DBH; # database handler
my $CGI; # web (common gateway interface)


# helper functions

sub query($)
{
	my $sql_command = shift;
	if (index($sql_command, 'user_sessions') == -1)
	{
		say '$sql_command '.$sql_command;	
	}
	
	my $query = $DBH->prepare($sql_command) or die DBI->errstr;
	$query->execute() or die DBI->errstr;
	$query->finish();
}

sub queryResult($)
{
	my $sql_command = shift;
	
#	say '$sql_command '.$sql_command;
	
	my $query = $DBH->prepare($sql_command) or die DBI->errstr;
	$query->execute() or die DBI->errstr;
	
	my @row = $query->fetchrow_array();
	my $returnValue = $row[0];
	
	$query->finish();
	
	return $returnValue;
}

sub queryResultPrepared
{
	my $prepared_query = shift;
	
	my $i_param = 1;
	foreach my $param (@_)
	{
	    $prepared_query->bind_param($i_param, $param);
	    $i_param++;
    }
	
	$prepared_query->execute() or die DBI->errstr;
	my $returnValue = ($prepared_query->fetchrow_array())[0];
	$prepared_query->finish();
	
	return $returnValue;
}

sub queryAllPrepared
{
	my $prepared_query = shift;
	
	my $i_param = 1;
	foreach my $param (@_)
	{
	    $prepared_query->bind_param($i_param, $param);
	    $i_param++;
    }
	
	$prepared_query->execute() or die DBI->errstr;
	my @returnValue = $prepared_query->fetchrow_array();
	$prepared_query->finish();
	
	return @returnValue;
}

sub queryAll($)
{
	my $sql_command = shift;
	
#	say $sql_command;
	
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
	
	my $user_id = userId($user_name);
	if (!defined $user_id) # couldn't find user for this name
	{
		print 0;
		
		return;
	}
	
	my $actual_pw_sha2 = queryResult
	(
		'SELECT pw FROM user'
		.' WHERE user_name = "'.$user_name.'"'
	);
	my $entered_pw_sha2 = queryResult
	(
		'SELECT sha2("'.$pw.'", 224)'
	);
	
	# compare provided & actual password
	if ($actual_pw_sha2 eq $entered_pw_sha2)
	{
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
		
		# create & save random session key (makes guessing sessions difficult)
		my $session_key = queryResult
		(
			'SELECT sha2(concat('.$user_id.', now()), 224)'
		);
		query
		(
			'UPDATE user_sessions'
			.' SET session_key = "'.$session_key.'"'
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

sub load() # TODO combine queries where possible, for better performance
{
	my $scroll_name = $CGI->param('scroll');
	my $column_name = $CGI->param('column'); # could be a fragment also
	
	my %id2SignType;
	my @sign_types = queryAll
	(
		'SELECT sign_type_id, type FROM sign_type'
	);
	for (my $i = 0; $i < scalar @sign_types; $i += 2)
	{
		$id2SignType{$sign_types[$i]} = $sign_types[$i + 1];
	}
	
	my $column_start_sign_id = queryResult # TODO scroll owner relevant?
	(
		'SELECT sign_id'
		.' FROM sign'
		
		.' JOIN real_area'
		.' ON real_area.real_area_id = sign.real_areas_id'
		
		.' JOIN line'
		.' ON line.line_id = real_area.line_id'
		
		.' JOIN column_of_scroll'
		.' ON column_of_scroll.column_of_scroll_id = line.column_id'
		
		.' JOIN scroll'
		.' ON scroll.scroll_id = column_of_scroll.scroll_id'
		
		.' WHERE FIND_IN_SET("COLUMN_START", sign.break_type) > 0'
		.' AND scroll.name = "'.$scroll_name.'"'
		.' AND column_of_scroll.name = "'.$column_name.'"'
	);
	if (!defined $column_start_sign_id)
	{
		print 0;
		return;
	}
	my $next_sign_id = $column_start_sign_id;
	
	# prepare queries
	my $get_next_sign_id_query = $DBH->prepare
	(
		'SELECT next_sign_id'
		.' FROM position_in_stream'
		.' WHERE sign_id = ?'
	);
	my $get_main_sign_query = $DBH->prepare
	(
		'SELECT *, FIND_IN_SET("COLUMN_END", sign.break_type)'
		.' FROM sign'
		.' WHERE sign_id = ?'
	);
#	my $get_line_id_and_name_query = $DBH->prepare
#	(
#		'SELECT line.line_id, name'
#		.' FROM line'
#		
#		.' JOIN real_area'
#		.' ON real_area.line_id = line.line_id'
#		
#		.' JOIN sign'
#		.' ON sign.real_areas_id = real_area.real_area_id'
#		
#		.' WHERE sign.sign_id = ?'
#	);
	my $get_line_id_and_name_query = $DBH->prepare
	(
		'SELECT line.line_id, name'
		.' FROM line'
		.' WHERE line.line_id =' 
		
		.' ('
		.'   SELECT real_area.line_id'
		.'   FROM real_area'
		.'   WHERE real_area.real_area_id ='
		
		.'   ('
		.'     SELECT real_areas_id'
		.'     FROM sign'
		.'     WHERE sign.sign_id = ?'
		.'   )'
		
		.' )'
	);
	my $get_variant_signs_query = $DBH->prepare
	(
		'SELECT *'
		.' FROM sign'
		.' WHERE sign_id IN'
		
		.' ('
		.'    SELECT sign_id'
		.'    FROM is_variant_sign_of' 
		.'    WHERE main_sign_id = ?'
		.' )'
	);
	my $get_sign_position_query = $DBH->prepare
	(
		'SELECT type'
		.' FROM sign_relative_position'
		.' WHERE sign_relative_position_id = ?'
		.' ORDER by level'
	);
	
	my $json_string = '[';
	
	my $previous_line_id = -1;
	my $i_area_in_line;
	
	# build json till first column end is encountered (capped to the signs of 100,000 real areas)
	for (my $i_area = 0; $i_area < 100000; $i_area++)
	{
		# move along the position stream
		$next_sign_id = queryResultPrepared
		(
			$get_next_sign_id_query,
			$next_sign_id
		);

		# get main sign from position stream
		my @main_sign = queryAllPrepared
		(
			$get_main_sign_query,
			$next_sign_id
		);
		if (defined $main_sign[17]
		&&  $main_sign[17] > 0) # column end # TODO expects column end as main sign
		{
			last;
		}
		pop @main_sign; # remove column end detection to get same array length as for alternative signs
		
		# add new line, if needed
		my @current_line = queryAllPrepared
		(
			$get_line_id_and_name_query,
			$main_sign[0]
		);
		if ($current_line[0] != $previous_line_id) # new line started
		{
			if (length $json_string > 1) # 1+ line was already added
			{
				$json_string .= ']},'; # end previous line
			}
			$json_string .= '{"lineName":"'.$current_line[1].'","signs":[';
			
			$previous_line_id = $current_line[0];
		}
		
		# save main sign & its alternatives
		if (substr($json_string, -1) eq ']') # second or later area within line
		{
			$json_string .= ',['; # start area
		}
		else # first area
		{
			$json_string .= '[';	
		}
		my @sign_data = (@main_sign, queryAllPrepared # TODO ignores 3rd alternative
		(
			$get_variant_signs_query,
			$next_sign_id
		));
		for (my $i_sign_data = 0; $i_sign_data < scalar @sign_data; $i_sign_data += 17)
		{
			if ($i_sign_data == 0) # first possible sign (and main sign) of area
			{
				$json_string .= '{';				
			}
			else # later sign
			{
				$json_string .= ',{';
			}
			
			$json_string .= '"id":'.$sign_data[$i_sign_data];
			
			# skip date_of_adding
			
			my $a = $sign_data[$i_sign_data + 2];
			if (!($a eq '?'))
			{
				$json_string .= ',"sign":"'.$a.'"';	
			}
			
			$a = $sign_data[$i_sign_data + 3];
			if ($a != 1) # not a letter
			{
				$json_string .= ',"signType":"'.$id2SignType{$a}.'"';
			}
			
			$a = $sign_data[$i_sign_data + 4];
			if ($a != 0
			&&  $a != 1) # width other than 0.0 (not a letter) and 1.0 (standard letter)
			{
				$json_string .= ',"width":'.$a;
			}
			
			if ($sign_data[$i_sign_data + 5] != 0) # might be wider
			{
				$json_string .= ',"mightBeWider":1';
			}
			
			# skip vocalization_id
			
			$a = $sign_data[$i_sign_data + 7];
			if (defined $a
			&&  !($a eq 'COMPLETE')) # readability impaired
			{
				$json_string .= ',"damaged":"'.$a.'"';
			}
			
			$a = $sign_data[$i_sign_data + 8];
			if (defined $a) # readable areas are declared
			{
				$json_string .= ',"readableAreas":"'.$a.'"';
			}
			
			if ($sign_data[$i_sign_data + 9] == 1) # is reconstructed
			{
				$json_string .= ',"reconstructed":1';
			}
			
			if ($sign_data[$i_sign_data + 10] == 1) # is retraced
			{
				$json_string .= ',"retraced":1';
			}
			
			# skip form_of_writing_id
			
			$a = $sign_data[$i_sign_data + 12];
			if (defined $a
			&&  !($a eq 'NO')) # editorial flag is set
			{
				$json_string .= ',"suggested":"'.$a.'"';
			}
			
			$a = $sign_data[$i_sign_data + 13];
			if (defined $a) # commentary exists
			{
				$json_string .= ',"comment":"'.$a.'"';
			}
			
			# skip real_areas_id
			
			$a = $sign_data[$i_sign_data + 15];
			if (defined $a) # break type(s)
			{
				$json_string .= ',"break":"'.$a.'"';
			}
			
			$a = $sign_data[$i_sign_data + 16];
			if (defined $a
			&&  !($a eq '')) # there is 1+ correction
			{
				$json_string .= ',"corrected":"'.$a.'"';
			}
			
			my @sign_position = queryAllPrepared
			(
				$get_sign_position_query,
				$sign_data[$i_sign_data]
			);
			if (@sign_position) # TODO level 2 positions etc.
			{
				$json_string .= ',"position":"'.$sign_position[0].'"';
			}
			
			$json_string .= '}';
		}
		$json_string .= ']'; # end area
	}
	
	if (length $json_string > 1) # 1+ line was added
	{
		$json_string .= ']}'; # close signs array and line
	}
	$json_string .= ']'; # end json
	
	print $json_string;
}

sub potentially_save_new_variant()
{
	my %new_variant = %{ decode_json($CGI->param('variant')) };
	
	# set dummy values for stringification
	if (! defined $new_variant{'mightBeWider'})
	{
		$new_variant{'mightBeWider'} = 0;
	}
	if (! defined $new_variant{'reconstructed'})
	{
		$new_variant{'reconstructed'} = 0;
	}
	if (! defined $new_variant{'retraced'})
	{
		$new_variant{'retraced'} = 0;
	}
	if (! defined $new_variant{'commentary'})
	{
		$new_variant{'commentary'} = '';
	}
	
	# stringify for comparison
	
	my $new_variant_stringified
	=  $new_variant{'sign'         }.'§'
	. ($new_variant{'width'} * 1000).'§' # neutralizes decimal formatting issues
	.  $new_variant{'mightBeWider' }.'§'
	.  $new_variant{'reconstructed'}.'§'
	.  $new_variant{'retraced'     }.'§'
	.  $new_variant{'commentary'   }.'§'
	.  $new_variant{'corrected'    }.'§'
	.  $new_variant{'position'     }.'§';
	
	say '$new_variant_stringified '.$new_variant_stringified;
	  
	my @existingSigns = queryAll
	(
		'SELECT *'
		.' FROM sign'
		.' WHERE sign_id = '.$new_variant{'mainSignId'}
		.' OR sign_id IN'
		
		.' ('
		.'    SELECT sign_id'
		.'    FROM is_variant_sign_of' 
		.'    WHERE main_sign_id = '.$new_variant{'mainSignId'}
		.' )'
	);
	
	my @sign_strings;
	my $sign_amount = (scalar @existingSigns) / 17;
	
	my $is_new_variant = 1;
	
	for (my $i_sign = 0; $i_sign < $sign_amount; $i_sign++)
	{
		my $position = queryResult
		(
			'SELECT type'
			.' FROM sign_relative_position'
			.' WHERE sign_relative_position_id = '.$existingSigns[$i_sign * 17]
		);
		
		my $sign_string = ''
		. $existingSigns[$i_sign * 17 +  2].'§' # actual sign
		.($existingSigns[$i_sign * 17 +  4] * 1000).'§' # width, multiplied with 1000 to standardize formatting
		. $existingSigns[$i_sign * 17 +  5].'§' # might be wider
		. $existingSigns[$i_sign * 17 +  9].'§' # reconstructed
		. $existingSigns[$i_sign * 17 + 10].'§' # retraced
		. $existingSigns[$i_sign * 17 + 13].'§' # commentary
		. $existingSigns[$i_sign * 17 + 16].'§' # correction
		. $position                        .'§';
		
		say '$sign_string '.$sign_string;
		
		if ($sign_string eq $new_variant_stringified)
		{
			$is_new_variant = 0;
			last;
		}
	}
	
	if (!$is_new_variant)
	{
		print 0;
		return;
	}
	
	# save to table sign # TODO
	
	my $sql_query = 'INSERT INTO sign SET ';
	if (defined $new_variant{'sign'})
	{
		$sql_query .= 'sign = "'.$new_variant{'sign'}.'",';
	}
	if ($new_variant{'width' != 1})
	{
		$sql_query .= 'width = '.$new_variant{'width'}.',';
	}
	if (defined $new_variant{'corrected'})
	{
		$sql_query .= 'correction = "'.$new_variant{'corrected'}.'",';
	}
	$sql_query .= 'might_be_wider = '.$new_variant{'mightBeWider'}.',';
	$sql_query .= 'readability = "COMPLETE",';
	$sql_query .= 'is_reconstructed = '.$new_variant{'reconstructed'}.',';
	$sql_query .= 'is_retraced = '.$new_variant{'retraced'}.',';
	$sql_query .= 'commentary = "'.$new_variant{'commentary'}.'",';
	$sql_query .= 'real_areas_id = '.$existingSigns[14].',';
	
	$sql_query = substr($sql_query, 0, (length $sql_query) - 1); # remove final ,
	query
	(
		$sql_query
	);
	
	my $sign_id = lastInsertedId();
	my $user_id = userId $CGI->param('user');
	if (undef $user_id || $user_id == '')
	{
		$user_id = 5; # TODO
	}
	
	# table sign_owner
	query # TODO set proper version
	(
		'INSERT INTO sign_owner'
		.' SET sign_id = '.$sign_id
		.' , user_id = '.$user_id
	);
	
	# table sign_relative_position
	if (defined $new_variant{'position'})
	{
		query
		(
			'INSERT INTO sign_relative_position'
			.' SET sign_relative_position_id = '.$sign_id
			.' , type = '.$new_variant{'position'}
		);
	}
	
	# table is_variant_sign_of
	query # TODO proper rank
	(
		'INSERT INTO is_variant_sign_of'
		.' SET main_sign_id = '.$new_variant{'mainSignId'}
		.' , sign_id = '.$sign_id
	);
}

sub save_single_sign_change()
{
	my $user_id = userId $CGI->param('user'); # TODO replace by session check
	if (!defined $user_id)
	{
		print 0;
		return;
	}
	
	my @signs = @{ decode_json $CGI->param('signs') }; # main sign, afterwards variant readings
	
	my $idsString = '';
	my @idsArray;
	for my $sign (@signs) # collect ids of main sign & its variants
	{
		my $a = %{ $sign }{'sign_id'};
		if (!defined $a)
		{
			next;
		}
		
		if (length $idsString > 0)
		{
			$idsString .= ',';
		}
		$idsString .= $a;
		
		push @idsArray, $a;
	}
	
	my @signs_in_db = queryAll
	(
		'SELECT *'
		.' FROM sign'
		.' WHERE sign_id IN'
		.' ('.$idsString.')'
	);
	
	# say Dumper @signs_in_db;
	
	for (my $i_id = 0; $i_id < scalar @idsArray; $i_id++)
	{
		my %attributes = %{ $signs[$i_id] };
		
#		if (%attributes{''})
#		
#		
#		
#	2 	date_of_adding 	timestamp 			Ja 	CURRENT_TIMESTAMP 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	3 	signIndex 	char(1) 	utf8_general_ci 		Nein 	? 	the sign itself\nspaces = text-space („ „) + _is_vacat=no\nvacat = text-space + is_vacat=yes\nthe logic is: we would like to distinguish between different width of spaces without to decide beforehand whether it is an intended vacat or not. 		Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	4 	sign_type_idIndex 	tinyint(3) 		UNSIGNED 	Nein 	1 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	5 	width 	decimal(6,3) 			Nein 	1.000 	width in chars\ncan also be used as a sloppy way to estimate the place used by the sign (especially when there are no font-information), which is handy if the sign is not yet related to a real area\nFinally the value 255 marks a break with unknown width 		Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	6 	might_be_wider 	tinyint(1) 			Nein 	0 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	7 	vocalization_id 	tinyint(3) 		UNSIGNED 	Ja 	NULL 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	8 	readability 	enum('COMPLETE', 'INCOMPLETE_BUT_CLEAR', 'INCOMPLE... 	utf8_general_ci 		Ja 	NULL 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	9 	readable_areas 	set('NW', 'NE', 'MW', 'ME', 'SW', 'SE') 	utf8_general_ci 		Ja 	NULL 	2x4-field set to locate readable areas can be used to set brackets in a more sophisticated way NW NE MNW MNE MSW MSE SW SE 		Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	10 	is_reconstructed 	tinyint(1) 			Nein 	0 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	11 	is_retraced 	tinyint(1) 			Nein 	0 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	12 	form_of_writing_idIndex 	int(11) 		UNSIGNED 	Nein 	1 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	13 	editorial_flag 	enum('NO', 'CONJECTURE', 'SHOULD_BE_ADDED', 'SHOUL... 	utf8_general_ci 		Ja 	NULL 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	14 	commentary 	text 	utf8_general_ci 		Ja 	NULL 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	15 	real_areas_idIndex 	int(11) 		UNSIGNED 	Ja 	NULL 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	16 	break_type 	set('LINE_START', 'LINE_END', 'COLUMN_START', 'COL... 	utf8_general_ci 		Ja 	NULL 			Bearbeiten Bearbeiten 	Löschen Löschen 	
#
#    Mehr
#
#	17 	correction 
		
	}
	
	
	
	
	
	
	
	
	
	
	
	# TODO
	# check whether equal to existing main sign / variant
	# if yes, skip
	# if no, create new variant
	# relevant tables: sign, sign_owner?, sign_relative_pos, is_variant_of, more?
	
	# assumed default values set by DB:
	# sign_type_id = 1, width = 1, might_be_wider = 0, vocalization_id = null
	# readability = null, readable_areas = (NW,NE,MW,ME,SW,SE)
	# is_reconstructed = 0, is_retraced = 0, deletion = null (not deleted)
	# form_of_writing_id = 0
	# editorial_flag = null
	# commentary = null (later: no sign_comment entry)
}

sub saveMarkup()
{
	my $markup = $CGI->param('markup');
	my $user_name = $CGI->param('user');
	
	my $user_id = userId($user_name);
	if (!defined $user_id)
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
	if (!defined $user_id)
	{
		say 'error: not logged in when saving signs';
		return;
	}
	
	my $input = $CGI->param('signs');
	say 'JSON: '.$input."\n";
	
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
				
				say Dumper(%sign_entries);
				
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
				
				say 'saved to DB';
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
	say '$user_id '."$user_id";
	
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
	say '$json_string '.$json_string;
}

# fetch request
$CGI = CGI->new;
my $request = $CGI->param('request');
if (!defined $request)
{
	say 'Undefined request (running from command line?)';
	$DBH = SQE_database::get_dbh;
	getAllComments();
	exit;
}
print $CGI->header('text/plain; charset=utf-8'); # support for Hebrew etc. characters


# connect to database
$DBH = SQE_database::get_dbh;

if ($request eq 'login')
{
	login;
}
elsif ($request eq 'logout')
{
	logout;
}
elsif ($request eq 'getManifest')
{
	getManifest;
}
elsif ($request eq 'load')
{
	load;
}
elsif ($request eq 'potentiallySaveNewVariant')
{
	potentially_save_new_variant;
}
elsif ($request eq 'saveSingleSignChange')
{
	save_single_sign_change;
}
elsif ($request eq 'saveMarkup')
{
	saveMarkup;
}
elsif ($request eq 'saveSigns')
{
	saveSigns;
}
elsif ($request eq 'getAllComments')
{
	getAllComments;
}
elsif ($request eq 'saveComment')
{
	saveComment;
}
elsif ($request eq 'getAllContributions')
{
	getAllContributions;
}
elsif ($request eq 'deleteContribution')
{
	deleteContribution;
}
elsif ($request eq 'getAllResults')
{
	getAllResults;
}

$DBH->disconnect();