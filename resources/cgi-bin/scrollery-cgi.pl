#! /usr/bin/perl -CS

use strict;
use warnings;
use JSON::XS;
use MIME::Base64;
use lib qw(../perl-libs);
use SQE_CGI;
use Encode;

sub processCGI {
	my ($cgi, $error) = SQE_CGI->new;
	if (defined $error)
	{
		print('{"error":"'.@{$error}[1].'"}');
		exit;
	}

	my $json_post = decode_json(''.$cgi->param('POSTDATA'));
	my $transaction = $json_post->{transaction} || 'unspecified';
	my %action = (
		'validateSession'                => \&validateSession,
		'getCombs'                       => \&getCombs,
		'getArtOfComb'                   => \&getArtOfComb,
		'getArtOfImage'                  => \&getArtOfImage,
		'getImgOfComb'                   => \&getImgOfComb,
		'getColOfComb'                   => \&getColOfComb,
		'getFragsOfCol'                  => \&getFragsOfCol,
		'getColOfScrollID'               => \&getColOfScrollID,
		'getSignStreamOfColumn'          => \&getSignStreamOfColumn,
		'imagesOfFragment'               => \&getImagesOfFragment,
		'getIAAEdID'                     => \&getIAAEdID,
		'canonicalCompositions'          => \&getCanonicalCompositions,
		'canonicalID1'                   => \&getCanonicalID1,
		'canonicalID2'                   => \&getCanonicalID2,
		'getScrollColNameFromDiscCanRef' => \&getScrollColNameFromDiscCanRef,
		'institutions'                   => \&getInstitutions,
		'institutionPlates'              => \&getInstitutionPlates,
		'institutionFragments'           => \&getInstitutionFragments,
		'imagesOfInstFragments'          => \&imagesOfInstFragments,
		'institutionArtefacts'           => \&getInstitutionArtefacts,
		'addArtToComb'                   => \&addArtToComb,
		'newArtefact'                    => \&newArtefact,
		'getArtefactMask'                => \&getArtefactMask,
		'getScrollArtefacts'             => \&getScrollArtefacts,
		'getScrollWidth'                 => \&getScrollWidth,
		'getScrollHeight'                => \&getScrollHeight,
		'newCombination'                 => \&newCombination,
		'copyCombination'                => \&copyCombination,
		'nameCombination'                => \&nameCombination,
		'changeArtefactPoly'             => \&changeArtefactPoly,
		'setArtPosition' => \&setArtPosition,
		'setArtRotation' => \&setArtRotation,
	);

	if ($transaction eq 'unspecified'){
		print encode_json({'error', "No transaction requested."});
	} else {
		if (defined $action{$transaction}) {
			$action{$transaction}->($cgi, $json_post);
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
 		print Encode::decode('utf8', encode_json({results => \@fetchedResults}));
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
	my $json_post = shift;
	my $getCombsQuery = <<'MYSQL';
SELECT DISTINCT 
       scroll_data.scroll_id as scroll_id,
       scroll_data.name AS name,
       scroll_version.scroll_version_id AS version_id,
       scroll_data.scroll_data_id AS scroll_data_id,
       scroll_version_group.locked,
       scroll_version.user_id
FROM scroll_version
	JOIN scroll_version_group USING(scroll_version_group_id)
	JOIN scroll_data using(scroll_id)
	JOIN scroll_data_owner using(scroll_data_id)
WHERE scroll_version.user_id = ?
      OR scroll_version.user_id = 0
ORDER BY scroll_version.user_id DESC, LPAD(SPLIT_STRING(name, "Q", 1), 3, "0"),
	LPAD(SPLIT_STRING(name, "Q", 2), 3, "0")
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getCombsQuery) or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{user});
	readResults($sql);
	return;
}

sub getArtOfComb {
	my $cgi = shift;
	my $json_post = shift;
	my $getColOfCombQuery = <<'MYSQL';
SELECT DISTINCT artefact_position.artefact_id AS id
FROM artefact_position
	JOIN artefact_position_owner USING(artefact_position_id)
WHERE artefact_position.scroll_id = ?
      AND artefact_position_owner.scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getColOfCombQuery) or die
		"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{combID}, $json_post->{version_id});
	readResults($sql);
	return;
}

sub getArtOfImage {
	my $cgi = shift;
	my $json_post = shift;
	my $getArtOfImageQuery = <<'MYSQL';
SELECT DISTINCT artefact_shape.artefact_id, artefact_data.name
FROM artefact_shape
	JOIN artefact_shape_owner USING(artefact_shape_id)
	JOIN artefact_data USING(artefact_id)
	JOIN artefact_data_owner USING(artefact_data_id)
	JOIN SQE_image USING(sqe_image_id)
WHERE SQE_image.image_catalog_id = ?
      AND artefact_shape_owner.scroll_version_id = ?
      AND artefact_data_owner.scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getArtOfImageQuery) or die
		"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{image_id}, $json_post->{version_id}, $json_post->{version_id});
	readResults($sql);
	return;
}

sub getImgOfComb {
	my $cgi = shift;
	my $json_post = shift;
	my $getColOfCombQuery = <<'MYSQL';
SELECT DISTINCT image_catalog.catalog_number_1 AS lvl1,
       image_catalog.catalog_number_2 AS lvl2,
	   image_catalog.catalog_side AS side,
	image_catalog.institution,
	   image_catalog.image_catalog_id AS id
FROM image_catalog
	JOIN image_to_edition_catalog USING (image_catalog_id)
	JOIN edition_catalog USING (edition_catalog_id)
	JOIN SQE_image USING(image_catalog_id)
WHERE edition_catalog.scroll_id = ?
	AND SQE_image.is_master = 1
ORDER BY lvl1, lvl2, side
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getColOfCombQuery) or die
		"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{combID});
	readResults($sql);
	return;
}

sub getColOfComb {
	my $cgi = shift;
	my $json_post = shift;
	my $getColOfCombQuery = <<'MYSQL';
		SELECT DISTINCT col_data.name AS name,
						col_data.col_id AS id
		FROM col_data
			JOIN col_data_owner USING(col_data_id)
			JOIN scroll_to_col USING(col_id)
		WHERE col_data_owner.scroll_version_id = ?
			AND scroll_to_col.scroll_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getColOfCombQuery) or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{version_id}, $json_post->{combID});
	readResults($sql);
	return;
}

sub getFragsOfCol {
	my $cgi = shift;
	my $json_post = shift;
	my $getFragsOfColQuery = <<'MYSQL';
		SELECT discrete_canonical_reference.discrete_canonical_reference_id,
			discrete_canonical_reference.column_name,
			discrete_canonical_reference.fragment_name,
			discrete_canonical_reference.sub_fragment_name,
			discrete_canonical_reference.fragment_column,
			discrete_canonical_reference.side,
			discrete_canonical_reference.column_of_scroll_id
		FROM discrete_canonical_reference
		WHERE discrete_canonical_reference.column_of_scroll_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getFragsOfColQuery) or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{colID});
	readResults($sql);
	return;
}

sub getColOfScrollID {
	my $cgi = shift;
	my $json_post = shift;
	my $getColOfScrollIDQuery = <<'MYSQL';
		SELECT scroll.name AS scroll_name,
			   column_of_scroll.name as col_name
		FROM discrete_canonical_reference
			INNER JOIN scroll
				ON scroll.scroll_id = discrete_canonical_reference.discrete_canonical_name_id
			INNER JOIN column_of_scroll
				ON column_of_scroll.column_of_scroll_id = discrete_canonical_reference.column_of_scroll_id
		WHERE discrete_canonical_reference.discrete_canonical_reference_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getColOfScrollIDQuery) or die
			"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{discCanRef});
	readResults($sql);
	return;
}

sub getSignStreamOfColumn {
	my $cgi = shift;
	my $json_post = shift;
	my $getScrollsQuery = << 'MYSQL';
SELECT
	col_data.name AS col_name,
	col_data.col_id AS col_id,
	line_data.name AS line_name,
	line_data.line_id AS line_id,
	parent.sign_id AS prev_sign_id,
	child.sign_id AS sign_id,
	child.next_sign_id AS next_sign_id,
	sign_char.is_variant,
	sign_char.sign, 
	sequence,
	attribute.name AS attribute_name,
	type,
	attribute.description AS attribute_description,
	value,
	string_value,
	attribute_value.description AS attribute_value_description,
	css
FROM position_in_stream AS child
	JOIN position_in_stream AS parent
		ON parent.next_sign_id = child.sign_id
	JOIN position_in_stream_owner
		ON position_in_stream_owner.position_in_stream_id = child.position_in_stream_id
	JOIN line_to_sign 
		ON line_to_sign.sign_id = child.sign_id
	JOIN line_to_sign_owner USING(line_to_sign_id)
	JOIN line_data USING(line_id)
	JOIN col_to_line USING(line_id)
	JOIN col_to_line_owner USING(col_to_line_id)
	JOIN col_data USING(col_id)
	JOIN sign_char
		ON sign_char.sign_id = child.sign_id
	JOIN sign_attribute USING(sign_char_id)
	JOIN sign_attribute_owner USING(sign_attribute_id)
	LEFT JOIN attribute_numeric USING(sign_attribute_id)
	JOIN attribute_value USING(attribute_value_id)
	LEFT JOIN attribute_value_css USING(attribute_value_id)
	JOIN attribute USING(attribute_id)
WHERE col_to_line.col_id = ?
	AND position_in_stream_owner.scroll_version_id = ?
	AND line_to_sign_owner.scroll_version_id = ?
	AND col_to_line_owner.scroll_version_id = ?
	AND sign_attribute_owner.scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare($getScrollsQuery) or die
		"Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{colId}, $json_post->{SCROLL_VERSION}, $json_post->{SCROLL_VERSION}, $json_post->{SCROLL_VERSION}, $json_post->{SCROLL_VERSION});
	readResults($sql);
	return;
}

sub getImagesOfFragment {
	my $cgi = shift;
	my $json_post = shift;
	my $sql;
	my $idType = $json_post->{idType};
	my $getImagesOfFragmentQuery;

	if ($idType eq 'composition') {
		$getImagesOfFragmentQuery = <<'MYSQL';
SELECT 	SQE_image.filename AS filename,
		  SQE_image.wavelength_start AS start,
		  SQE_image.wavelength_end AS end,
		  SQE_image.is_master,
		  SQE_image.native_width AS width,
		  SQE_image.native_height AS height,
		  image_urls.url AS url
FROM SQE_image
	JOIN image_urls USING(image_urls_id)
	JOIN edition_catalog USING(edition_catalog_id)
	JOIN edition_catalog_to_discrete_reference USING(edition_catalog_id)
	JOIN discrete_canonical_reference USING(discrete_canonical_reference_id)
WHERE edition_catalog.edition_side=0
      AND discrete_canonical_reference.column_of_scroll_id = ?
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
	$sql->execute($json_post->{id});
	readResults($sql);
	return;
}

sub getIAAEdID {
        my $cgi = shift;
		my $json_post = shift;
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
        $sql->execute($json_post->{discCanRef});
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
	my $json_post = shift;
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
	$sql->execute($json_post->{composition});
	readResults($sql);
	return;
}

sub getCanonicalID2 {
	my $cgi = shift;
	my $json_post = shift;
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
	$sql->execute($json_post->{composition}, $json_post->{edition_location_1});
	readResults($sql);
	return;
}

sub getScrollColNameFromDiscCanRef {
	my $cgi = shift;
	my $json_post = shift;
	my $frag_id = $cgi->param('frag_id');
	my $getScrollColNameFromDiscCanRefQuery = <<'MYSQL';
		SELECT scroll_data.name AS scroll,
			   col_data.name AS col
		FROM scroll_to_col
			INNER JOIN scroll_data
				ON scroll_data.scroll_id = scroll_to_col.scroll_id
			INNER JOIN col_data
				ON col_data.col_id = scroll_to_col.col_id
			INNER JOIN discrete_canonical_reference
				ON discrete_canonical_reference.column_of_scroll_id = scroll_to_col.col_id
		WHERE discrete_canonical_reference.discrete_canonical_reference_id = ?
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
	my $json_post = shift;
	my $getInstitutionPlates = <<'MYSQL';
		SELECT DISTINCT institution,
			catalog_number_1 AS catalog_plate
		FROM image_catalog
		WHERE institution = ?
		ORDER BY CAST(catalog_number_1 AS UNSIGNED)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getInstitutionPlates)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{institution});
	readResults($sql);
	return;
}

sub getInstitutionFragments {
	my $cgi = shift;
	my $json_post = shift;
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
	$sql->execute($json_post->{institution}, $json_post->{catalog_number_1});
	readResults($sql);
	return;
}

sub imagesOfInstFragments {
	my $cgi = shift;
	my $json_post = shift;
	my $getInstitutionFragmentsQuery = <<'MYSQL';
SELECT DISTINCT	SQE_image.filename AS filename,
		  SQE_image.wavelength_start AS start,
		  SQE_image.wavelength_end AS end,
		  SQE_image.is_master,
		  SQE_image.native_width AS width,
		  SQE_image.native_height AS height,
		  SQE_image.type AS type,
		  image_urls.url AS url,
		  image_urls.suffix AS suffix,
		  edition_catalog.edition_side
FROM SQE_image
	JOIN image_urls USING(image_urls_id)
	LEFT JOIN SQE_image_to_edition_catalog USING(sqe_image_id)
	LEFT JOIN edition_catalog USING(edition_catalog_id)
WHERE image_catalog_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getInstitutionFragmentsQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{id});
	readResults($sql);
	return;
}

sub getInstitutionArtefacts {
	my $cgi = shift;
	my $json_post = shift;
	my $getInstitutionArtefactsQuery = <<'MYSQL';
		SELECT DISTINCT artefact_shape.artefact_id,
			user_id
		FROM artefact_shape
			JOIN SQE_image ON SQE_image.sqe_image_id = artefact_shape.sqe_image_id
			JOIN artefact_shape_owner USING(artefact_shape)
			JOIN scroll_version USING(scroll_version_id)
		WHERE SQE_image.image_catalog_id = ?
			  AND user_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getInstitutionArtefactsQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{catalog_id}, $json_post->{user_id});
	readResults($sql);
	return;
}

sub getScrollWidth {
	my $cgi = shift;
	my $json_post = shift;
	my $getScrollWidthQuery = <<'MYSQL';
		CALL getScrollWidth(?,?)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getScrollWidthQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{scroll_id}, $json_post->{scroll_version_id});
	readResults($sql);
	return;
}

sub getScrollHeight {
	my $cgi = shift;
	my $json_post = shift;
	my $getScrollHeightQuery = <<'MYSQL';
		CALL getScrollHeight(?,?)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getScrollHeightQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{scroll_id}, $json_post->{scroll_version_id});
	readResults($sql);
	return;
}

# First I copy the artefect to a new artefact owner with the currect scroll_version_id
# Then I change the scroll_id of the artefact to match the current scroll_id
# TODO update for new DB structure.
sub addArtToComb {
	my $cgi = shift;
	my $json_post = shift;
	my $scroll_version_id =  $json_post->{version_id};
	$cgi->dbh->set_scrollversion($scroll_version_id);
	my $addArtToCombQuery = <<'MYSQL';
		INSERT IGNORE INTO artefact_owner (artefact_id, scroll_version_id)
		VALUES(?,?)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($addArtToCombQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
    $sql->execute($json_post->{art_id}, $scroll_version_id);
    $sql->finish;

	my ($new_scroll_data_id, $error) = $cgi->dbh->add_value("artefact", $json_post->{art_id}, "scroll_id", $json_post->{scroll_id});
	handleDBError ($new_scroll_data_id, $error);
}

# I should create an artefact, link an artefact_data,
# then create the necessary owner tables by using the SQE API.
# TODO update for new DB structure.
sub newArtefact {
	my $cgi = shift;
	my $json_post = shift;
	my $scroll_version_id =  $json_post->{version_id};
	$cgi->dbh->set_scrollversion($scroll_version_id);

	# Get the sqe_image_id for our image
	my $getSQEImageIdQuery = <<'MYSQL';
SELECT sqe_image_id
FROM SQE_image
WHERE image_catalog_id = ?
      AND is_master = 1
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getSQEImageIdQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{image_id});
	my $sqe_image_id = $sql->fetchrow_arrayref()->[0];

	# Create new artefact
	my $addArtToImageQuery = <<'MYSQL';
INSERT INTO artefact (sqe_image_id, region_in_master_image)
VALUES(?, ST_GEOMFROMTEXT(?))
MYSQL
	$sql = $cgi->dbh->prepare_cached($addArtToImageQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($sqe_image_id, $json_post->{region_in_master_image});
	my $artefact_id = $sql->{mysql_insertid};

	# create artefact owner table
	my $addArtOwnerQuery = <<'MYSQL';
INSERT INTO artefact_owner (artefact_id, scroll_version_id)
VALUES(?, ?)
MYSQL
	$sql = $cgi->dbh->prepare_cached($addArtOwnerQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($artefact_id, $scroll_version_id);

	# Run add value so that undo tracking system follows along
#	my ($new_artefact_id, $art_error) = $cgi->dbh->add_value("artefact", $artefact_id, "sqe_image_id", $json_post->{sqe_image_id});
#	if ($artefact_id ne $new_artefact_id) {
#		handleDBError ($new_artefact_id, $art_error);
#	}

	# create artefact_data
	my $addArtDataQuery = <<'MYSQL';
INSERT INTO artefact_data (artefact_id, name)
VALUES(?, ?)
MYSQL
	$sql = $cgi->dbh->prepare_cached($addArtDataQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($artefact_id, $json_post->{name});
	my $artefact_data_id = $sql->{mysql_insertid};

	#create artefact_data_owner table
	my $addArtDataOwnerQuery = <<'MYSQL';
INSERT INTO artefact_data_owner (artefact_data_id, scroll_version_id)
VALUES(?, ?)
MYSQL
	$sql = $cgi->dbh->prepare_cached($addArtDataOwnerQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($artefact_data_id, $scroll_version_id);

	# Run add value so that undo tracking system follows along
#	my ($new_artefact_data_id, $art_data_error) = $cgi->dbh->add_value("artefact_data", $artefact_data_id, "name", $json_post->{name});
#	if ($artefact_data_id ne $new_artefact_data_id) {
#		handleDBError ($new_artefact_data_id, $art_data_error);
#	}

	# create artefact_position
	my $addArtPositionQuery = <<'MYSQL';
INSERT INTO artefact_position (artefact_id, scroll_id, transform_matrix)
VALUES(?, ?, ?)
MYSQL
	$sql = $cgi->dbh->prepare_cached($addArtPositionQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($artefact_id, $json_post->{scroll_id}, '{"matrix": [[1,0,0],[0,1,0]]}');
	my $artefact_position_id = $sql->{mysql_insertid};

	#create artefact_data_owner table
	my $addArtPositionOwnerQuery = <<'MYSQL';
INSERT INTO artefact_position_owner (artefact_position_id, scroll_version_id)
VALUES(?, ?)
MYSQL
	$sql = $cgi->dbh->prepare_cached($addArtPositionOwnerQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($artefact_position_id, $scroll_version_id);

	# Run add value so that undo tracking system follows along
#	my ($new_artefact_position_id, $art_pos_error) = $cgi->dbh->add_value("artefact_position", $artefact_position_id, "scroll_id", $json_post->{scroll_id});
#	if ($artefact_position_id ne $new_artefact_position_id) {
#		handleDBError ($new_artefact_position_id, $art_pos_error);
#	} else {
#		handleDBError ($artefact_id, $art_error);
#	}
	handleDBError ($artefact_id);
}

sub getArtefactMask {
	my $cgi = shift;
	my $json_post = shift;
	my $addArtToCombQuery = <<'MYSQL';
SELECT ST_AsText(region_in_sqe_image) as poly
	FROM artefact_shape
	JOIN artefact_shape_owner USING(artefact_shape_id)
	WHERE artefact_id = ?
		AND scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($addArtToCombQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{artID}, $json_post->{scrollVersion});
	readResults($sql);
	return;
}

sub getScrollArtefacts {
	my $cgi = shift;
	my $json_post = shift;
	my $getScrollArtefactsQuery = <<'MYSQL';
SELECT DISTINCT artefact_position.artefact_position_id AS id,
                ST_AsText(ST_Envelope(artefact_shape.region_in_sqe_image)) AS rect,
                ST_AsText(artefact_shape.region_in_sqe_image) AS poly,
				artefact_position.transform_matrix AS matrix,
                image_urls.url AS url,
                image_urls.suffix AS suffix,
                SQE_image.filename AS filename,
                SQE_image.dpi AS dpi
FROM artefact_position_owner
	JOIN artefact_position USING(artefact_position_id)
	JOIN artefact_shape USING(artefact_id)
	JOIN artefact_shape_owner USING(artefact_shape_id)
	INNER JOIN SQE_image USING(sqe_image_id)
	INNER JOIN image_urls USING(image_urls_id)
	INNER JOIN image_catalog USING(image_catalog_id)
WHERE artefact_position.scroll_id=?
      AND artefact_position_owner.scroll_version_id=?
	  AND artefact_shape_owner.scroll_version_id=?
      AND image_catalog.catalog_side=0
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getScrollArtefactsQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{scroll_id}, $json_post->{scroll_version_id}, $json_post->{scroll_version_id});
	readResults($sql);
	return;
}

sub newCombination {
	my $cgi = shift;
	my $json_post = shift;
	my $user_id = $cgi->dbh->user_id;
	my $name = $json_post->{name}; 

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
	my $json_post = shift;
	$cgi->dbh->add_owner_to_scroll($json_post->{scroll_id}, $json_post->{scroll_version_id});
	print '{"scroll_clone": "success"}';
	return;
}

sub nameCombination {
	my $cgi = shift;
	my $json_post = shift;
	my $scroll_id = $json_post->{scroll_id};
	my $scroll_data_id = $json_post->{scroll_data_id};
	my $version_id = $json_post->{version_id};
	my $scroll_name = $json_post->{name};
	$cgi->dbh->set_scrollversion($version_id);
	my $user_id = $cgi->dbh->user_id;
	my ($new_scroll_data_id, $error) = $cgi->dbh->change_value("scroll_data", $scroll_data_id, "name", $scroll_name);
	handleDBError ($new_scroll_data_id, $error);
	return;
}

sub changeArtefactPoly {
	my $cgi = shift;
	my $json_post = shift;
	$cgi->dbh->set_scrollversion($json_post->{version_id});
	my ($new_art_id, $new_art_error) = $cgi->dbh->change_value("artefact_shape", $json_post->{artefact_id}, "region_in_sqe_image", ['ST_GEOMFROMTEXT', $json_post->{region_in_sqe_image}]);
	if ($new_art_error) {
		handleDBError ($new_art_id, $new_art_error);
	}

	my $getArtDataQuery = <<'MYSQL';
SELECT artefact_data_id
FROM artefact_data
WHERE artefact_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getArtDataQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{artefact_id});
	my $artefact_data_id = $sql->fetchrow_arrayref()->[0];
	my ($new_art_data_id, $data_error) = $cgi->dbh->change_value("artefact_data", $artefact_data_id, "artefact_id", $new_art_id);
	if ($data_error) {
		handleDBError ($new_art_data_id, $data_error);
	}

	my $getArtPosQuery = <<'MYSQL';
SELECT artefact_position_id
FROM artefact_position
WHERE artefact_id = ?
MYSQL
	$sql = $cgi->dbh->prepare_cached($getArtPosQuery)
		or die "Couldn't prepare statement: " . $cgi->dbh->errstr;
	$sql->execute($json_post->{artefact_id});
	my $artefact_pos_id = $sql->fetchrow_arrayref()->[0];
	my ($new_art_pos_id, $pos_error) = $cgi->dbh->change_value("artefact_position", $artefact_pos_id, "artefact_id", $new_art_id);
	if ($pos_error) {
		handleDBError ($new_art_data_id, $pos_error);
	}
	print '{"artefact_id": ' . $new_art_id . ', "artefact_data_id": ' . $new_art_pos_id . ', "artefact_position_id": ' . $new_art_pos_id . '}';

	return;
}

sub setArtPosition {
	my $cgi = shift;
	my $json_post = shift;
	$cgi->dbh->set_scrollversion($json_post->{version_id});
	my ($new_id, $error) = $cgi->dbh->change_value("artefact_position", $json_post->{art_id}, "transform_matrix", $json_post->{matrix});
	handleDBError ($new_id, $error);
	return;
}

sub setArtRotation {
	my $cgi = shift;
	my $json_post = shift;
	my $user_id = $cgi->dbh->user_id;
	$cgi->dbh->set_scrollversion($json_post->{version_id});
	my ($new_id, $error) = $cgi->dbh->change_value("artefact", $json_post->{art_id}, "rotation", $json_post->{rotation});
	handleDBError ($new_id, $error);
	return;
}

processCGI();
