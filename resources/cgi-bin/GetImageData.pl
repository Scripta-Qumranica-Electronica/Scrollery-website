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
my $transaction = $cgi->param('transaction') || 'unspecified';
my @fetchedResults = ();
my $dbh;
my $sql;
my %action = (
	## Start-Old functions, to be replaced later
	'readFragmentData' => \&getFragmentData,
	'readFragmentPosition' => \&getFragmentPos,
	'readFragmentPicture' => \&getFragmentPicture,
	'readManuscriptData' => \&getManuscriptData,
	'writeMask' => \&setMask,
	'writeFragLocation' => \&setFragmentLocation,
	'writeFragRotation' => \&setFragmentRotation,
	## End-Old functions, to be replaced later

	'getCombs' => \&getCombs,
	'getColOfComb' => \&getColOfComb,
	'getFragsOfCol' => \&getFragsOfCol,
	'getIAAEdIDandColOfScrollID' => \&getIAAEdIDandColOfScrollID,
	'getColOfScrollID' => \&getColOfScrollID,
	'getIAAEdID' => \&getIAAEdID,
	'imagesOfFragment' => \&getImagesOfFragment,
	'allFragments' => \&getAllFragments,
	'canonicalCompositions' => \&getCanonicalCompositions,
	'canonicalID1' => \&getCanonicalID1,
	'canonicalID2' => \&getCanonicalID2,
	'institutions' => \&getInstitutions,
	'institutionPlates' => \&getInstitutionPlates,
	'institutionFragments' => \&getInstitutionFragments,
	'getPolygon' => \&getPolygon,
);
		
print $cgi->header(
    		-type    => 'application/json',
    		-charset =>  'utf-8',
			);

if ($transaction eq 'unspecified'){
	print encode_json({'error', "No transaction requested."});
} else {
	if (defined $action{$transaction}) {
		##Connect to database
		$dbh = SQE_database::get_dbh;
        $action{$transaction}->($dbh);
		##Disconnect from DB and close
		$dbh->disconnect();
    } else {
        print encode_json({'error', "Transaction type '" . $transaction . "' not understood."});
    }
}

# Various data return methods, see %action for hash table. 
sub readResults (){
	while (my $result = $sql->fetchrow_hashref){
       	push @fetchedResults, $result;
    }
    if (scalar(@fetchedResults) > 0) {
 		print encode_json({results => \@fetchedResults});
 	} else {
    	print 'No results found.';
 	}
}

sub getCombs {
	$sql = $dbh->prepare('SELECT * FROM scroll') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute();
	readResults();
	return;
}

sub getColOfComb {
	my $combID = $cgi->param('combID');
	$sql = $dbh->prepare('select distinct column_of_scroll.name, column_of_scroll.column_of_scroll_id from column_of_scroll inner join discrete_canonical_references on discrete_canonical_references.column_of_scroll_id = column_of_scroll.column_of_scroll_id where discrete_canonical_references.discrete_canonical_name_id = ?') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($combID);
	readResults();
	return;
}

sub getFragsOfCol {
	my $colID = $cgi->param('colID');
	$sql = $dbh->prepare('SELECT discrete_canonical_references.discrete_canonical_reference_id, discrete_canonical_references.column_name, discrete_canonical_references.fragment_name, discrete_canonical_references.sub_fragment_name, discrete_canonical_references.fragment_column, discrete_canonical_references.side from column_of_scroll inner join  discrete_canonical_references on  discrete_canonical_references.column_of_scroll_id = column_of_scroll.column_of_scroll_id where column_of_scroll.column_of_scroll_id = ?') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($colID);
	readResults();
	return;
}

sub getIAAEdIDandColOfScrollID {
	my $discCanRef = $cgi->param('discCanRef');
	$sql = $dbh->prepare('select scroll.name as scroll_name, edition_catalog_to_discrete_reference.edition_id, column_of_scroll.name as col_name from discrete_canonical_references inner join scroll on scroll.scroll_id = discrete_canonical_references.discrete_canonical_name_id inner join edition_catalog_to_discrete_reference on edition_catalog_to_discrete_reference.disc_can_ref_id = discrete_canonical_references.discrete_canonical_reference_id inner join edition_catalog on edition_catalog.edition_catalog_id = edition_catalog_to_discrete_reference.edition_id inner join column_of_scroll on column_of_scroll.column_of_scroll_id = discrete_canonical_references.column_of_scroll_id where edition_catalog.edition_side=0 and discrete_canonical_references.discrete_canonical_reference_id = ?') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($discCanRef);
	readResults();
	return;
}

sub getColOfScrollID {
	my $discCanRef = $cgi->param('discCanRef');
	$sql = $dbh->prepare('select scroll.name as scroll_name, column_of_scroll.name as col_name from discrete_canonical_references inner join scroll on scroll.scroll_id = discrete_canonical_references.discrete_canonical_name_id inner join column_of_scroll on column_of_scroll.column_of_scroll_id = discrete_canonical_references.column_of_scroll_id where discrete_canonical_references.discrete_canonical_reference_id = ?') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($discCanRef);
	readResults();
	return;
}

sub getIAAEdID {
	my $discCanRef = $cgi->param('discCanRef');
	$sql = $dbh->prepare('select edition_catalog_to_discrete_reference.edition_id from discrete_canonical_references inner join scroll on scroll.scroll_id = discrete_canonical_references.discrete_canonical_name_id inner join edition_catalog_to_discrete_reference on edition_catalog_to_discrete_reference.disc_can_ref_id = discrete_canonical_references.discrete_canonical_reference_id inner join edition_catalog on edition_catalog.edition_catalog_id = edition_catalog_to_discrete_reference.edition_id where edition_catalog.edition_side=0 and discrete_canonical_references.discrete_canonical_reference_id = ?') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($discCanRef);
	readResults();
	return;
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
	$sql = $dbh->prepare('CALL getMasterImageListings()') or die
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

sub getImagesOfFragment {
	my $idType = $cgi->param('idType');
	my $id = $cgi->param('id');
	if ($idType eq 'composition') {
		$sql = $dbh->prepare('SELECT * FROM SQE_image WHERE edition_id = ?') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	} elsif ($idType eq 'institution') {
		$sql = $dbh->prepare('SELECT * FROM SQE_image WHERE image_catalog_id = ?') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	}
	$sql->execute($id);
	readResults();
	return;
}

sub getAllFragments {
	$sql = $dbh->prepare('CALL getAllFragments()') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute();
	readResults();
	return;
}

sub getCanonicalCompositions {
	$sql = $dbh->prepare('SELECT DISTINCT composition FROM edition_catalog ORDER BY BIN(composition) ASC, composition ASC') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute();
	readResults();
	return;
}

sub getCanonicalID1 {
	my $composition = $cgi->param('composition');
	$sql = $dbh->prepare('SELECT DISTINCT composition, edition_location_1 FROM edition_catalog WHERE composition = ? ORDER BY BIN(edition_location_1) ASC, edition_location_1 ASC') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($composition);
	readResults();
	return;
}

sub getCanonicalID2 {
	my $composition = $cgi->param('composition');
	my $edition_location_1 = $cgi->param('edition_location_1');
	$sql = $dbh->prepare('SELECT edition_location_2, edition_catalog_id FROM edition_catalog WHERE composition = ? AND edition_location_1 = ? AND edition_side = 0 ORDER BY CAST(edition_location_2 as unsigned)') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($composition, $edition_location_1);
	readResults();
	return;
}

sub getInstitutions {
	$sql = $dbh->prepare('SELECT DISTINCT institution FROM image_catalog') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute();
	readResults();
	return;
}

sub getInstitutionPlates {
	my $institution = $cgi->param('institution');
	$sql = $dbh->prepare('SELECT DISTINCT institution, catalog_number_1 FROM image_catalog WHERE institution = ? ORDER BY CAST(catalog_number_1 as unsigned)') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($institution);
	readResults();
	return;
}

sub getInstitutionFragments {
	my $institution = $cgi->param('institution');
	my $catalog_number_1 = $cgi->param('catalog_number_1');
	$sql = $dbh->prepare('SELECT catalog_number_2, image_catalog_id FROM image_catalog WHERE institution = ? AND catalog_number_1 = ? AND catalog_side = 0 ORDER BY CAST(catalog_number_2 as unsigned)') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($institution, $catalog_number_1);
	readResults();
	return;
}

sub getPolygon {
	my $master_image_id = $cgi->param('master_image_id');
	$sql = $dbh->prepare('select ST_AsText(region_in_master_image) from artefact where master_image_id=?') 
		or die "Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($master_image_id);
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
	
	print '<body>Success!</body>';
	return;
}
sub setFragmentRotation {
	my $fragID = $cgi->param('fragID');
	my $rotation = $cgi->param('rotation');
	$sql = $dbh->prepare('UPDATE fragment SET rotation = ? WHERE id = ?') or die
			"Couldn't prepare statement: " . $dbh->errstr;
	$sql->execute($rotation, $fragID);
	
	print '<body>Success!</body>';
	return;
}