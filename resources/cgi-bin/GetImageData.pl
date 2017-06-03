#!/usr/bin/perl

use strict;
use warnings;
use DBI;
use CGI;
use JSON::XS;
use MIME::Base64;
use lib qw(/home/perl_libs);
use SQE_database;

my $cgi = new CGI;
my $transaction = $cgi->param('transaction');
print $transaction;
my @fetchedResults = ();
my $sql;
my %action = (
	'readFragmentData' => \&getFragmentData,
	'readFragmentPosition' => \&getFragmentPos,
	'readFragmentPicture' => \&getFragmentPicture,
	'readManuscriptData' => \&getManuscriptData,
	'writeMask' => \&setMask,
	'writeFragLocation' => \&setFragmentLocation,
	'writeFragRotation' => \&setFragmentRotation,
);
		
##Connect to database
my $dbh = SQE_database::get_dbh;
		

if (defined $action{$transaction}) {
        $action{$transaction}->();
    } else {
        print "Transaction not understood.";
        do_exit();
    }

    exit 0;

sub readResults {
	while (my $result = $sql->fetchrow_hashref){
       	push @fetchedResults, $result;
    }
    if (scalar(@fetchedResults) > 0) {
 		print $cgi->header(
    		-type    => 'application/json',
    		-charset =>  'utf-8',
  		), encode_json({results => \@fetchedResults});
 	} else {
    	print 'No results found.';
 	}
 	
 	##Disconnect from DB and close
	$dbh->disconnect();
}

sub getManuscriptData {
	$sql = $dbh->prepare('SELECT * FROM fragment') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute();
	readResults();
	return;
}
sub getFragmentData {
	my $fragID = $cgi->param('fragID');
	$sql = $dbh->prepare('SELECT * FROM SQE_image') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute();
	readResults();
	return;
}
sub getFragmentPos {
	my $fragID = $cgi->param('fragID');
	$sql = $dbh->prepare('SELECT x_pos, y_pos, rotation FROM fragment WHERE id = ?') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($fragID);
	readResults();
	return;
}
sub getFragmentPicture {
	my $fragID = $cgi->param('fragID');
	my $side = $cgi->param('side');
	my $type = $cgi->param('type');
	$sql = $dbh->prepare('SELECT * FROM image WHERE side = ?
				AND type = ? AND fragmentID = ?') or die "Couldn't prepare statement: " . 
				$dbh->errstr;
	$sql->execute($side, $type, $fragID);
	readResults();
	return;
}
sub setMask {
	my $maskSVG = $cgi->param('maskSVG');
	my $centerX = $cgi->param('centerX');
	my $centerY = $cgi->param('centerY');
	my $mask = $cgi->param('mask');
	$mask =~ s/data:image\/png;base64,//;
	my $maskPath = '/var/www/html/bronson/Scrollery-master/scrollImages/';
	my $imageID = $cgi->param('imageID');
	
	my $decodedMask= MIME::Base64::decode_base64($mask);
  	my $filename = $imageID . '.png';
 	open my $fh, '>', $maskPath . $filename or die $!;
 	binmode $fh;
 	print $fh $decodedMask;
 	close $fh;
	
	$sql = $dbh->prepare('UPDATE image SET mask = ?, mask_path = ?, center_x = ?, center_y = ? WHERE id = ?') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($filename, $maskSVG, $centerX, $centerY, $imageID);
	
	print $cgi->header('text/html;charset=UTF-8');
	print '<body>Success!</body>';
	return;
}

sub setFragmentLocation {
	my $fragID = $cgi->param('fragID');
	my $x = $cgi->param('x');
	my $y = $cgi->param('y');
	$sql = $dbh->prepare('UPDATE fragment SET x_pos = ?, y_pos = ? WHERE id = ?') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($x, $y, $fragID);
	
	print $cgi->header('text/html;charset=UTF-8');
	print '<body>Success!</body>';
	return;
}
sub setFragmentRotation {
	my $fragID = $cgi->param('fragID');
	my $rotation = $cgi->param('rotation');
	$sql = $dbh->prepare('UPDATE fragment SET rotation = ? WHERE id = ?') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($rotation, $fragID);
	
	print $cgi->header('text/html;charset=UTF-8');
	print '<body>Success!</body>';
	return;
}
