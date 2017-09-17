#! /usr/bin/perl
# C:\Strawberry\perl\bin\perl.exe

use strict;
use warnings;
use JSON::XS;
use MIME::Base64;
use lib qw(/home/perl_libs);
#use lib qw(C:/Users/Martin/Desktop/martin/qumran/Entwicklung/Workspace/Scrollery/cgi-bin-ingo/);
use SQE_CGI;

sub processCGI {
	# my $cgi;
	# my $error;
	my ($cgi, $error) = SQE_CGI->new;
	if (defined $error)
	{
		print('{"error":"'.@{$error}[1].'"}');
		exit;
	}

	my $transaction = $cgi->param('transaction') || 'unspecified';
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
		'getScrollColNameFromDiscCanRef' => \&getScrollColNameFromDiscCanRef,
		'institutions' => \&getInstitutions,
		'institutionPlates' => \&getInstitutionPlates,
		'institutionFragments' => \&getInstitutionFragments,
		'getPolygon' => \&getPolygon,
		'getScrollArtefacts' => \&getScrollArtefacts,
		'newCombination' => \&newCombination,
		'copyCombination' => \&copyCombination,
		'setArtPosition' => \&setArtPosition,
	);

	print $cgi->header(
				-type    => 'application/json',
				-charset =>  'utf-8',
				);

	if ($transaction eq 'unspecified'){
		print encode_json({'error', "No transaction requested."});
	} else {
		if (defined $action{$transaction}) {
			$action{$transaction}->($cgi);
		} else {
			print encode_json({'error', "Transaction type '" . $transaction . "' not understood."});
		}
	}
}

# Various data return methods, see %action for hash table. 
sub readResults {
	my $sql = shift;
	my @fetchedResults = ();
	while (my $result = $sql->fetchrow_hashref){
       	push @fetchedResults, $result;
    }
    if (scalar(@fetchedResults) > 0) {
 		print encode_json({results => \@fetchedResults});
 	} else {
    	print 'No results found.';
 	}
	$sql->finish;
}

sub getCombs {
	
	my $cgi = shift;
	my $userID = $cgi->param('user');
	my $sql = $cgi->dbh->prepare('select scroll_version.scroll_id as scroll_id, scroll_data.name as name, scroll_version.version as version from scroll_version inner join scroll_data on scroll_data.scroll_id = scroll_version.scroll_id where scroll_version.user_id = ? order by LPAD(SPLIT_STRING(name, "Q", 1), 3, "0"), LPAD(SPLIT_STRING(name, "Q", 2), 3, "0"), scroll_version.version') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($userID);
	readResults($sql);
	return;
}

sub getColOfComb {
	
	my $cgi = shift;
	my $userID = $cgi->param('user');
	my $version = $cgi->param('version');
	my $combID = $cgi->param('combID');
	my $sql = $cgi->dbh->prepare('select col_data_owner.scroll_version_id as version, col_data.name as name, col_data.col_id as col_id from col_data inner join col_data_owner on col_data_owner.col_data_id = col_data.col_data_id inner join scroll_to_col on scroll_to_col.col_id = col_data.col_id inner join scroll_version on scroll_version.scroll_version_id = col_data_owner.scroll_version_id where scroll_version.user_id = ? and scroll_version.version = ? and scroll_to_col.scroll_id = ?') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($userID, $version, $combID);
	readResults($sql);
	return;
}

sub getFragsOfCol {
	
	my $cgi = shift;
	my $userID = $cgi->param('user');
	my $version = $cgi->param('version');
	my $colID = $cgi->param('colID');
	my $sql = $cgi->dbh->prepare('SELECT discrete_canonical_references.discrete_canonical_reference_id, discrete_canonical_references.column_name, discrete_canonical_references.fragment_name, discrete_canonical_references.sub_fragment_name, discrete_canonical_references.fragment_column, discrete_canonical_references.side from discrete_canonical_references where discrete_canonical_references.column_of_scroll_id = ?') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($colID);
	readResults($sql);
	return;
}

sub getIAAEdIDandColOfScrollID {
	
	my $cgi = shift;
	my $discCanRef = $cgi->param('discCanRef');
	my $sql = $cgi->dbh->prepare('select scroll.name as scroll_name, edition_catalog_to_discrete_reference.edition_id, column_of_scroll.name as col_name from discrete_canonical_references inner join scroll on scroll.scroll_id = discrete_canonical_references.discrete_canonical_name_id inner join edition_catalog_to_discrete_reference on edition_catalog_to_discrete_reference.disc_can_ref_id = discrete_canonical_references.discrete_canonical_reference_id inner join edition_catalog on edition_catalog.edition_catalog_id = edition_catalog_to_discrete_reference.edition_id inner join column_of_scroll on column_of_scroll.column_of_scroll_id = discrete_canonical_references.column_of_scroll_id where edition_catalog.edition_side=0 and discrete_canonical_references.discrete_canonical_reference_id = ?') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($discCanRef);
	readResults($sql);
	return;
}

sub getColOfScrollID {
	
	my $cgi = shift;
	my $discCanRef = $cgi->param('discCanRef');
	my $sql = $cgi->dbh->prepare('select scroll.name as scroll_name, column_of_scroll.name as col_name from discrete_canonical_references inner join scroll on scroll.scroll_id = discrete_canonical_references.discrete_canonical_name_id inner join column_of_scroll on column_of_scroll.column_of_scroll_id = discrete_canonical_references.column_of_scroll_id where discrete_canonical_references.discrete_canonical_reference_id = ?') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($discCanRef);
	readResults($sql);
	return;
}

sub getIAAEdID {
	
	my $cgi = shift;
	my $discCanRef = $cgi->param('discCanRef');
	my $sql = $cgi->dbh->prepare('select edition_catalog_to_discrete_reference.edition_id from edition_catalog_to_discrete_reference inner join edition_catalog on edition_catalog.edition_catalog_id = edition_catalog_to_discrete_reference.edition_id where edition_catalog.edition_side=0 and edition_catalog_to_discrete_reference.disc_can_ref_id = ?') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($discCanRef);
	readResults($sql);
	return;
}

sub getManuscriptData {
	
	my $cgi = shift;
	my $sql = $cgi->dbh->prepare('SELECT * FROM fragment') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute();
	readResults($sql);
	return;
}
sub getFragmentData {
	
	my $cgi = shift;
	my $fragID = $cgi->param('fragID');
	my $sql = $cgi->dbh->prepare('CALL getMasterImageListings()') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute();
	readResults($sql);
	return;
}
sub getFragmentPos {
	
	my $cgi = shift;
	my $fragID = $cgi->param('fragID');
	my $sql = $cgi->dbh->prepare('SELECT x_pos, y_pos, rotation FROM fragment WHERE id = ?') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($fragID);
	readResults($sql);
	return;
}
sub getFragmentPicture {
	
	my $cgi = shift;
	my $fragID = $cgi->param('fragID');
	my $side = $cgi->param('side');
	my $type = $cgi->param('type');
	my $sql = $cgi->dbh->prepare('SELECT image.filename as filename, image.is_master as is_master FROM image WHERE side = ?
				AND type = ? AND fragmentID = ?') or die "Couldn't prepare statement: " . 
				$cgi->dbh->errstr;
	$sql->execute($side, $type, $fragID);
	readResults($sql);
	return;
}

sub getImagesOfFragment {
	
	my $cgi = shift;
	my $sql;
	my $idType = $cgi->param('idType');
	my $id = $cgi->param('id');
	if ($idType eq 'composition') {
		$sql = $cgi->dbh->prepare('SELECT SQE_image.filename as filename, SQE_image.wavelength_start as start, SQE_image.wavelength_end as end, SQE_image.is_master, image_urls.url as url FROM SQE_image INNER JOIN image_urls on image_urls.id = SQE_image.url_code INNER JOIN image_catalog ON image_catalog.image_catalog_id = SQE_image.image_catalog_id INNER JOIN image_to_edition_catalog on image_to_edition_catalog.catalog_id = image_catalog.image_catalog_id WHERE image_to_edition_catalog.edition_id = ?') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	} elsif ($idType eq 'institution') {
		$sql = $cgi->dbh->prepare('SELECT * FROM SQE_image WHERE image_catalog_id = ?') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	}
	$sql->execute($id);
	readResults($sql);
	return;
}

sub getAllFragments {
	
	my $cgi = shift;
	my $sql = $cgi->dbh->prepare('CALL getAllFragments()') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute();
	readResults($sql);
	return;
}

sub getCanonicalCompositions {
	
	my $cgi = shift;
	my $sql = $cgi->dbh->prepare('SELECT DISTINCT composition FROM edition_catalog ORDER BY BIN(composition) ASC, composition ASC') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute();
	readResults($sql);
	return;
}

sub getCanonicalID1 {
	
	my $cgi = shift;
	my $composition = $cgi->param('composition');
	my $sql = $cgi->dbh->prepare('SELECT DISTINCT composition, edition_location_1 FROM edition_catalog WHERE composition = ? ORDER BY BIN(edition_location_1) ASC, edition_location_1 ASC') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($composition);
	readResults($sql);
	return;
}

sub getCanonicalID2 {
	
	my $cgi = shift;
	my $composition = $cgi->param('composition');
	my $edition_location_1 = $cgi->param('edition_location_1');
	my $sql = $cgi->dbh->prepare('SELECT edition_location_2, edition_catalog_id FROM edition_catalog WHERE composition = ? AND edition_location_1 = ? AND edition_side = 0 ORDER BY CAST(edition_location_2 as unsigned)') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($composition, $edition_location_1);
	readResults($sql);
	return;
}

sub getScrollColNameFromDiscCanRef {
	
	my $cgi = shift;
	my $frag_id = $cgi->param('frag_id');
	my $sql = $cgi->dbh->prepare('SELECT scroll_data.name as scroll, col_data.name as col from scroll_to_col inner join scroll_data on scroll_data.scroll_id = scroll_to_col.scroll_id inner join col_data on col_data.col_id = scroll_to_col.col_id inner join discrete_canonical_references on discrete_canonical_references.column_of_scroll_id = scroll_to_col.col_id where discrete_canonical_references.discrete_canonical_reference_id = ?') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($frag_id);
	readResults($sql);
	return;
}

sub getInstitutions {
	
	my $cgi = shift;
	my $sql = $cgi->dbh->prepare('SELECT DISTINCT institution FROM image_catalog') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute();
	readResults($sql);
	return;
}

sub getInstitutionPlates {
	
	my $cgi = shift;
	my $institution = $cgi->param('institution');
	my $sql = $cgi->dbh->prepare('SELECT DISTINCT institution, catalog_number_1 FROM image_catalog WHERE institution = ? ORDER BY CAST(catalog_number_1 as unsigned)') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($institution);
	readResults($sql);
	return;
}

sub getInstitutionFragments {
	
	my $cgi = shift;
	my $institution = $cgi->param('institution');
	my $catalog_number_1 = $cgi->param('catalog_number_1');
	my $sql = $cgi->dbh->prepare('SELECT catalog_number_2, image_catalog_id FROM image_catalog WHERE institution = ? AND catalog_number_1 = ? AND catalog_side = 0 ORDER BY CAST(catalog_number_2 as unsigned)') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($institution, $catalog_number_1);
	readResults($sql);
	return;
}

sub getPolygon {
	
	my $cgi = shift;
	my $master_image_id = $cgi->param('master_image_id');
	my $sql = $cgi->dbh->prepare('select ST_AsText(region_in_master_image) from artefact where master_image_id=?') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($master_image_id);
	readResults($sql);
	return;
}

sub getScrollArtefacts {
	
	my $cgi = shift;
	my $scroll_id = $cgi->param('scroll_id');
	my $sql = $cgi->dbh->prepare('CALL getScrollArtefacts(?, ?)') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($scroll_id, 0);
	readResults($sql);
	return;
}

sub newCombination {
	
	my $cgi = shift;
	my $user_id = $cgi->param('user_id');
	my $sql = $cgi->dbh->prepare('CALL getScrollArtefacts(?)') 
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($user_id);
	readResults($sql);
	return;
}

sub copyCombination {
	
	my $cgi = shift;
	my $scroll_id = $cgi->param('scroll_id');
	$cgi->dbh->add_owner_to_scroll($scroll_id);
	print '{"scroll_clone": "success"}';
	return;
}

sub setArtPosition {
	my $cgi = shift;
	my $art_id = $cgi->param('art_id');
	my $x = $cgi->param('x');
	my $y = $cgi->param('y');
	my ($new_id, $error) = $cgi->dbh->add_value("artefact", $art_id, "position_in_scroll", ['POINT', $x, $y]);
	if (defined $error) {
		print '{"error": "';
		foreach (@$error){
			print $_ . ' ';
		}
		print '"}';
	} else {
		print '{"new_id": ' . $new_id . '}';
	}
	return;
}

sub setMask {
	
	my $cgi = shift;
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
	
	my $sql = $cgi->dbh->prepare('UPDATE image SET mask = ?, mask_path = ?, center_x = ?, center_y = ? WHERE id = ?') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($filename, $maskSVG, $centerX, $centerY, $imageID);
	
	print '<body>Success!</body>';
	return;
}

sub setFragmentLocation {
	
	my $cgi = shift;
	my $fragID = $cgi->param('fragID');
	my $x = $cgi->param('x');
	my $y = $cgi->param('y');
	my $sql = $cgi->dbh->prepare('UPDATE fragment SET x_pos = ?, y_pos = ? WHERE id = ?') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($x, $y, $fragID);
	
	print '<body>Success!</body>';
	return;
}
sub setFragmentRotation {
	
	my $cgi = shift;
	my $fragID = $cgi->param('fragID');
	my $rotation = $cgi->param('rotation');
	my $sql = $cgi->dbh->prepare('UPDATE fragment SET rotation = ? WHERE id = ?') or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($rotation, $fragID);
	
	print '<body>Success!</body>';
	return;
}

processCGI();
