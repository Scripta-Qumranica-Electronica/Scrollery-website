#!/usr/bin/perl

use strict;
use warnings;
use DBI;
use CGI;
use JSON::XS;
use MIME::Base64;
use lib qw(/home/perl_libs);
use SQE_database;
use Data::Dumper;

my $cgi = new CGI;
my $sql;

		
##Connect to database
my $dbh = SQE_database::get_dbh;

sub getCanonicalOrderedListOfFragments {
	print $cgi->header(
		-type    => 'application/json',
		-charset =>  'utf-8',
		);

	$sql = $dbh->prepare('CALL getUniqueCanonicalCompositions()') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute();
	my @canonical_titles;
	my @results;
	while (my $result = $sql->fetchrow_hashref){
        print $result->{"composition"};
       	push @canonical_titles, $result->{"composition"};
    }
	
	foreach my $title (@canonical_titles) {
        print \$title . "\n";
		$sql = $dbh->prepare('CALL get_level_1_id_for_canonical_composition(?)') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
		$sql->execute(\$title);
		my @level_1_identifier;
		while (my $level1 = $sql->fetchrow_hashref){
       		push @level_1_identifier, $level1;
    	}
		my @results_level_1;
		foreach my $level1 (@level_1_identifier){
            print \$level1 . "\n";
			$sql = $dbh->prepare('CALL get_level_2_id_for_canonical_composition(?,?)')
			or die "Couldn't prepare statement: " . $dbh->errstr;
			$sql->execute($title, $level1);
			my @level_2_identifier;
			while (my $level2 = $sql->fetchrow_hashref){
                print $level2 . "\n";
       			push @level_2_identifier, $level2;
    		}
			push @results_level_1, {$level1 => \@level_2_identifier};
		}
		push @results, {$title => \@level_1_identifier};
	}

    if (scalar(@canonical_titles) > 0) {
 		#print encode_json({results => \@results});
 		print encode_json({results => [{"text_1" => [{"column I" => ["f1", "f2", "f3"]}, {"column II" => ["f1", "f2", "f3"]}]}, {"text_2" => [{"column I" => ["f1", "f2", "f3"]}, {"column II" => ["f1", "f2", "f3"]}]}]});
 	} else {
    	print 'No results found.';
 	}
	return;
}

getCanonicalOrderedListOfFragments();

##Disconnect from DB and close
$dbh->disconnect();