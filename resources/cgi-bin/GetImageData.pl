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
	my ($cgi, $error) = SQE_CGI->new;
	if (defined $error)
	{
		print('{"error":"'.@{$error}[1].'"}');
		exit;
	}

	my $transaction = $cgi->param('transaction') || 'unspecified';
	my %action = (
		'validateSession' => \&validateSession,
		'getCombs' => \&getCombs,
		'getArtOfComb' => \&getArtOfComb,
		'getImgOfComb' => \&getImgOfComb,
		'getColOfComb' => \&getColOfComb,
		'getFragsOfCol' => \&getFragsOfCol,
		'getColOfScrollID' => \&getColOfScrollID,
		'imagesOfFragment' => \&getImagesOfFragment,
		'getIAAEdID' => \&getIAAEdID,
		'canonicalCompositions' => \&getCanonicalCompositions,
		'canonicalID1' => \&getCanonicalID1,
		'canonicalID2' => \&getCanonicalID2,
		'getScrollColNameFromDiscCanRef' => \&getScrollColNameFromDiscCanRef,
		'institutions' => \&getInstitutions,
		'institutionPlates' => \&getInstitutionPlates,
		'institutionFragments' => \&getInstitutionFragments,
		'institutionArtefacts' => \&getInstitutionArtefacts,
		'addArtToComb' => \&addArtToComb,
		'getScrollArtefacts' => \&getScrollArtefacts,
		'getScrollWidth' => \&getScrollWidth,
		'getScrollHeight' => \&getScrollHeight,
		'newCombination' => \&newCombination,
		'copyCombination' => \&copyCombination,
		'nameCombination' => \&nameCombination,
		'setArtPosition' => \&setArtPosition,
		'setArtRotation' => \&setArtRotation,
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
 
# General purpose DB subroutines
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

sub handleDBError {
	my ($info, $error) = @_;
	if (defined $error) {
		print '{"error": "';
		foreach (@$error){
			print $_ . ' ';
		}
		print '"}';
	} else {
		print '{"returned_info": ' . $info . '}';
	}
}

# Various data return methods, see %action for hash table.
sub validateSession {
	my $cgi = shift;
	my $dbh = $cgi->dbh;

	$cgi->print('{"SESSION_ID":"'.$cgi->session_id.'", "USER_ID":'.$dbh->user_id.'}');
	return;
}

sub getCombs {
	my $cgi = shift;
	my $userID = $cgi->param('user');
	my $getCombsQuery = <<'MYSQL';
		select scroll_data.scroll_id as scroll_id,
			   scroll_data.name as name,
			   scroll_version.version as version,
			   scroll_version.scroll_version_id as version_id,
			   scroll_data.scroll_data_id as scroll_data_id,
			   (SELECT COUNT(*)
					FROM scroll_to_col_owner
					WHERE scroll_to_col_owner.scroll_version_id = version_id) as count
		from scroll_version
			join scroll_data_owner using(scroll_version_id)
			join scroll_data using(scroll_data_id)
		where scroll_version.user_id = ?
		order by LPAD(SPLIT_STRING(name, "Q", 1), 3, "0"),
			LPAD(SPLIT_STRING(name, "Q", 2), 3, "0"),
			scroll_version.version
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getCombsQuery) or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($userID);
	readResults($sql);
	return;
}

sub getArtOfComb {
	my $cgi = shift;
	my $userID = $cgi->param('user');
	my $version_id = $cgi->param('version_id');
	my $combID = $cgi->param('combID');
	my $getColOfCombQuery = <<'MYSQL';
SELECT DISTINCT artefact_position.artefact_id AS id
FROM artefact_position
	JOIN artefact_position_owner USING(artefact_position_id)
WHERE artefact_position.scroll_id = ?
      AND artefact_position_owner.scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getColOfCombQuery) or die
		"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($combID, $version_id);
	readResults($sql);
	return;
}

sub getImgOfComb {
	my $cgi = shift;
	my $userID = $cgi->param('user');
	my $version_id = $cgi->param('version_id');
	my $combID = $cgi->param('combID');
	my $getColOfCombQuery = <<'MYSQL';
SELECT DISTINCT image_catalog.catalog_number_1 AS lvl1,
       image_catalog.catalog_number_2 AS lvl2,
	image_catalog.institution,
	   image_catalog.image_catalog_id AS id
FROM image_catalog
	JOIN image_to_edition_catalog USING (image_catalog_id)
	JOIN edition_catalog_to_discrete_reference USING (edition_catalog_id)
	JOIN discrete_canonical_references USING (discrete_canonical_reference_id)
WHERE discrete_canonical_references.scroll_id = ?
ORDER BY lvl1, lvl2
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getColOfCombQuery) or die
		"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($combID);
	readResults($sql);
	return;
}

sub getColOfComb {
	my $cgi = shift;
	my $userID = $cgi->param('user');
	my $version_id = $cgi->param('version_id');
	my $combID = $cgi->param('combID');
	my $getColOfCombQuery = <<'MYSQL';
		SELECT DISTINCT col_data.name AS name,
			   col_data.col_id AS id,
			   (SELECT COUNT(*)
					FROM discrete_canonical_references
					WHERE discrete_canonical_references.column_of_scroll_id = id)
				   AS count
		FROM col_data
			JOIN col_data_owner USING(col_data_id)
			JOIN scroll_to_col USING(col_id)
			JOIN scroll_version USING(scroll_version_id)
		WHERE col_data_owner.scroll_version_id = ?
			  AND scroll_to_col.scroll_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getColOfCombQuery) or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($version_id, $combID);
	readResults($sql);
	return;
}

sub getFragsOfCol {
	my $cgi = shift;
	my $userID = $cgi->param('user');
	my $version = $cgi->param('version');
	my $colID = $cgi->param('colID');
	my $getFragsOfColQuery = <<'MYSQL';
		SELECT discrete_canonical_references.discrete_canonical_reference_id,
			discrete_canonical_references.column_name,
			discrete_canonical_references.fragment_name,
			discrete_canonical_references.sub_fragment_name,
			discrete_canonical_references.fragment_column,
			discrete_canonical_references.side,
			discrete_canonical_references.column_of_scroll_id
		FROM discrete_canonical_references
		WHERE discrete_canonical_references.column_of_scroll_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getFragsOfColQuery) or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($colID);
	readResults($sql);
	return;
}

sub getColOfScrollID {
	my $cgi = shift;
	my $discCanRef = $cgi->param('discCanRef');
	my $getColOfScrollIDQuery = <<'MYSQL';
		SELECT scroll.name AS scroll_name,
			   column_of_scroll.name as col_name
		FROM discrete_canonical_references
			INNER JOIN scroll
				ON scroll.scroll_id = discrete_canonical_references.discrete_canonical_name_id
			INNER JOIN column_of_scroll
				ON column_of_scroll.column_of_scroll_id = discrete_canonical_references.column_of_scroll_id
		WHERE discrete_canonical_references.discrete_canonical_reference_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getColOfScrollIDQuery) or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($discCanRef);
	readResults($sql);
	return;
}

sub getImagesOfFragment {
	my $cgi = shift;
	my $sql;
	my $idType = $cgi->param('idType');
	my $id = $cgi->param('id');
	my $getImagesOfFragmentQuery;

	if ($idType eq 'composition') {
		$getImagesOfFragmentQuery = <<'MYSQL';
SELECT 	SQE_image.filename AS filename,
		  SQE_image.wavelength_start AS start,
		  SQE_image.wavelength_end AS end,
		  SQE_image.is_master,
		  SQE_image.width AS width,
		  SQE_image.height AS height,
		  image_urls.url AS url
FROM SQE_image
	JOIN image_urls USING(image_urls_id)
	JOIN edition_catalog USING(edition_catalog_id)
	JOIN edition_catalog_to_discrete_reference USING(edition_catalog_id)
	JOIN discrete_canonical_references USING(discrete_canonical_reference_id)
WHERE edition_catalog.edition_side=0
      AND discrete_canonical_references.column_of_scroll_id = ?
MYSQL
	} elsif ($idType eq 'institution') {
		$getImagesOfFragmentQuery = <<'MYSQL';
			SELECT *
			FROM SQE_image
			WHERE image_catalog_id = ?
MYSQL
	}
	$sql = $cgi->dbh->prepare_cached($getImagesOfFragmentQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($id);
	readResults($sql);
	return;
}

sub getIAAEdID {
        my $cgi = shift;
        my $discCanRef = $cgi->param('discCanRef');
	my $getIAAEdIDQuery = <<'MYSQL';
		SELECT edition_catalog_to_discrete_reference.edition_id
		FROM edition_catalog_to_discrete_reference
			INNER JOIN edition_catalog
				USING(edition_catalog_id)
		WHERE edition_catalog.edition_side=0
			  AND edition_catalog_to_discrete_reference.disc_can_ref_id = ?
MYSQL
        my $sql = $cgi->dbh->prepare_cached($getIAAEdIDQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
        $sql->execute($discCanRef);
        readResults($sql);
        return;
}

sub getCanonicalCompositions {
	my $cgi = shift;
	my $getCanonicalCompositionsQuery = <<'MYSQL';
		SELECT DISTINCT composition
		FROM edition_catalog
		ORDER BY BIN(composition) ASC,
			composition ASC
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getCanonicalCompositionsQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute();
	readResults($sql);
	return;
}

sub getCanonicalID1 {
	my $cgi = shift;
	my $composition = $cgi->param('composition');
	my $getCanonicalID1Query = <<'MYSQL';
		SELECT DISTINCT composition,
			edition_location_1
		FROM edition_catalog
		WHERE composition = ?
		ORDER BY BIN(edition_location_1) ASC,
			edition_location_1 ASC
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getCanonicalID1Query)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($composition);
	readResults($sql);
	return;
}

sub getCanonicalID2 {
	my $cgi = shift;
	my $composition = $cgi->param('composition');
	my $edition_location_1 = $cgi->param('edition_location_1');
	my $getCanonicalID2Query = <<'MYSQL';
		SELECT edition_location_2, edition_catalog_id
		FROM edition_catalog
		WHERE composition = ?
			  AND edition_location_1 = ?
			  AND edition_side = 0
		ORDER BY CAST(edition_location_2 AS UNSIGNED)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getCanonicalID2Query)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($composition, $edition_location_1);
	readResults($sql);
	return;
}

sub getScrollColNameFromDiscCanRef {
	my $cgi = shift;
	my $frag_id = $cgi->param('frag_id');
	my $getScrollColNameFromDiscCanRefQuery = <<'MYSQL';
		SELECT scroll_data.name AS scroll,
			   col_data.name AS col
		FROM scroll_to_col
			INNER JOIN scroll_data
				ON scroll_data.scroll_id = scroll_to_col.scroll_id
			INNER JOIN col_data
				ON col_data.col_id = scroll_to_col.col_id
			INNER JOIN discrete_canonical_references
				ON discrete_canonical_references.column_of_scroll_id = scroll_to_col.col_id
		WHERE discrete_canonical_references.discrete_canonical_reference_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getScrollColNameFromDiscCanRefQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($frag_id);
	readResults($sql);
	return;
}

sub getInstitutions {
	my $cgi = shift;
	my $getInstitutionsQuery = <<'MYSQL';
		SELECT DISTINCT institution
		FROM image_catalog
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getInstitutionsQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute();
	readResults($sql);
	return;
}

sub getInstitutionPlates {
	my $cgi = shift;
	my $institution = $cgi->param('institution');
	my $getInstitutionPlates = <<'MYSQL';
		SELECT DISTINCT institution,
			catalog_number_1 AS catalog_plate
		FROM image_catalog
		WHERE institution = ?
		ORDER BY CAST(catalog_number_1 AS UNSIGNED)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getInstitutionPlates)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($institution);
	readResults($sql);
	return;
}

sub getInstitutionFragments {
	my $cgi = shift;
	my $institution = $cgi->param('institution');
	my $catalog_number_1 = $cgi->param('catalog_number_1');
	my $getInstitutionFragmentsQuery = <<'MYSQL';
		SELECT catalog_number_2 AS catalog_fragment,
			image_catalog_id
		FROM image_catalog
		WHERE institution = ?
			  AND catalog_number_1 = ?
			  AND catalog_side = 0
		ORDER BY CAST(catalog_number_2 AS UNSIGNED)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getInstitutionFragmentsQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($institution, $catalog_number_1);
	readResults($sql);
	return;
}

sub getInstitutionArtefacts {
	my $cgi = shift;
	my $catalog_id = $cgi->param('catalog_id');
	my $user_id = $cgi->param('user_id');
	my $getInstitutionArtefactsQuery = <<'MYSQL';
		SELECT DISTINCT artefact.artefact_id,
			user_id
		FROM artefact
			JOIN SQE_image ON SQE_image.sqe_image_id = artefact.sqe_image_id
			JOIN artefact_owner USING(artefact_id)
			JOIN scroll_version USING(scroll_version_id)
		WHERE SQE_image.image_catalog_id = ?
			  AND user_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getInstitutionArtefactsQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($catalog_id, $user_id);
	readResults($sql);
	return;
}

sub getScrollWidth {
	my $cgi = shift;
	my $scroll_id =  $cgi->param('scroll_id');
	my $scroll_version_id =  $cgi->param('scroll_version_id');
	my $getScrollWidthQuery = <<'MYSQL';
		CALL getScrollWidth(?,?)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getScrollWidthQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($scroll_id, $scroll_version_id);
	readResults($sql);
	return;
}

sub getScrollHeight {
	my $cgi = shift;
	my $scroll_id =  $cgi->param('scroll_id');
	my $scroll_version_id =  $cgi->param('scroll_version_id');
	my $getScrollHeightQuery = <<'MYSQL';
		CALL getScrollHeight(?,?)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getScrollHeightQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($scroll_id, $scroll_version_id);
	readResults($sql);
	return;
}

# First I copy the artefect to a new artefact owner with the currect scroll_version_id
# Then I change the scroll_id of the artefact to match the current scroll_id
sub addArtToComb {
	my $cgi = shift;
	my $art_id =  $cgi->param('art_id');
	my $scroll_id =  $cgi->param('scroll_id');
	my $scroll_version_id =  $cgi->param('version_id');
	$cgi->dbh->set_scrollversion($scroll_version_id);
	my $user_id = $cgi->dbh->user_id;
	my $addArtToCombQuery = <<'MYSQL';
		INSERT IGNORE INTO artefact_owner (artefact_id, scroll_version_id)
		VALUES(?,?)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($addArtToCombQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
    $sql->execute($art_id, $scroll_version_id);
    $sql->finish;

	my ($new_scroll_data_id, $error) = $cgi->dbh->add_value("artefact", $art_id, "scroll_id", $scroll_id);
	handleDBError ($new_scroll_data_id, $error);
}

sub getScrollArtefacts {
	my $cgi = shift;
	my $scroll_id = $cgi->param('scroll_id');
	my $version_id = $cgi->param('scroll_version_id');
	my $getScrollArtefactsQuery = <<'MYSQL';
SELECT DISTINCT artefact_position.artefact_position_id AS id,
                ST_AsText(ST_Envelope(artefact.region_in_master_image)) AS rect,
                ST_AsText(artefact.region_in_master_image) AS poly,
                ST_AsText(artefact_position.position_in_scroll) AS pos,
                image_urls.url AS url,
                image_urls.suffix AS suffix,
                SQE_image.filename AS filename,
                SQE_image.dpi AS dpi,
                artefact_position.rotation AS rotation
FROM artefact_position_owner
	JOIN artefact_position USING (artefact_position_id)
	JOIN artefact USING(artefact_id)
	JOIN scroll_version USING(scroll_version_id)
	INNER JOIN SQE_image USING(sqe_image_id)
	INNER JOIN image_urls USING(image_urls_id)
	INNER JOIN image_catalog USING(image_catalog_id)
WHERE artefact_position.scroll_id=?
      AND artefact_position_owner.scroll_version_id = ?
      AND image_catalog.catalog_side=0
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getScrollArtefactsQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($scroll_id, $version_id);
	readResults($sql);
	return;
}

sub newCombination {
	my $cgi = shift;
	my $user_id = $cgi->dbh->user_id;
	my $name = $cgi->param('name'); 

	my $newScroll = <<'MYSQL';
		INSERT INTO scroll ()
		VALUES()
MYSQL
	my $sql = $cgi->dbh->prepare_cached($newScroll)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute();
	my $scroll_id = $cgi->dbh->last_insert_id(undef, undef, undef, undef);

	my $newScrollVersion = <<'MYSQL';
		INSERT INTO scroll_version (user_id, scroll_id, version)
		VALUES(?, ?, 0)
MYSQL
	$sql = $cgi->dbh->prepare_cached($newScrollVersion)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($user_id, $scroll_id);
	my $scroll_version_id = $cgi->dbh->last_insert_id(undef, undef, undef, undef);

	my $newScrollData = <<'MYSQL';
		INSERT INTO scroll_data (name, scroll_id)
		VALUES(?, ?)
MYSQL
	$sql = $cgi->dbh->prepare_cached($newScrollData)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($name, $scroll_id);
	my $scroll_data_id = $cgi->dbh->last_insert_id(undef, undef, undef, undef);

	my $newScrollDataOwner = <<'MYSQL';
		INSERT INTO scroll_data_owner (scroll_data_id, scroll_version_id)
		VALUES(?, ?)
MYSQL
	$sql = $cgi->dbh->prepare_cached($newScrollDataOwner)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($scroll_data_id, $scroll_version_id);

	print '{"created": {"scroll_data": ' . $scroll_data_id . ', "scroll_version":' . $scroll_version_id . '}}';
	return;
}

sub copyCombination {
	my $cgi = shift;
	my $scroll_id = $cgi->param('scroll_id');
	my $scroll_version_id = $cgi->param('scroll_version_id');
	$cgi->dbh->add_owner_to_scroll($scroll_id, $scroll_version_id);
	print '{"scroll_clone": "success"}';
	return;
}

sub nameCombination {
	my $cgi = shift;
	my $scroll_id = $cgi->param('scroll_id');
	my $scroll_data_id = $cgi->param('scroll_data_id');
	my $version_id = $cgi->param('version_id');
	my $scroll_name = $cgi->param('name');
	$cgi->dbh->set_scrollversion($version_id);
	my $user_id = $cgi->dbh->user_id;
	my ($new_scroll_data_id, $error) = $cgi->dbh->change_value("scroll_data", $scroll_data_id, "name", $scroll_name);
	handleDBError ($new_scroll_data_id, $error);
	return;
}

sub setArtPosition {
	my $cgi = shift;
	my $version_id = $cgi->param('version_id');
	$cgi->dbh->set_scrollversion($version_id);
	my $artefact_position_id = $cgi->param('art_id');
	my $x = $cgi->param('x') * 1;
	my $y = $cgi->param('y') * 1;
	my ($new_id, $error) = $cgi->dbh->change_value("artefact_position", $artefact_position_id, "position_in_scroll", ['POINT', $x, $y]);
	handleDBError ($new_id, $error);
	return;
}

sub setArtRotation {
	my $cgi = shift;
	my $user_id = $cgi->dbh->user_id;
	my $scroll_id = $cgi->param('scroll_id');
	my $version_id = $cgi->param('version_id');
	$cgi->dbh->set_scrollversion($version_id);
	my $art_id = $cgi->param('art_id');
	my $rotation = $cgi->param('rotation');
	my ($new_id, $error) = $cgi->dbh->change_value("artefact", $art_id, "rotation", $rotation);
	handleDBError ($new_id, $error);
	return;
}

processCGI();
