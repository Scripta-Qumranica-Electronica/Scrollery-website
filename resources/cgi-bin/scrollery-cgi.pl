#! /usr/bin/perl

use strict;
use warnings;
use utf8::all;
use JSON::XS;
use Ref::Util qw<is_hashref is_arrayref>;
use MIME::Base64;
use lib qw(../perl-libs);
use SQE_CGI;
use Encode;
use Data::Dumper;

sub processCGI {
	my ($cgi, $error) = SQE_CGI->new;
	if (defined $error)
	{
		print('{"error":"'.@{$error}[1].'"}');
		exit;
	}

	my %actions = (
		validateSession => \&validateSession,
		requestCombs => \&requestCombs,
    getImages => \&getImages,
		requestArtOfComb => \&requestArtOfComb,
		requestArtOfImage => \&requestArtOfImage,
		requestImgOfComb => \&requestImgOfComb,
		requestColOfComb => \&requestColOfComb,
		getSignStreamOfColumn => \&getSignStreamOfColumn,
		getSignStreamOfFrag => \&getSignStreamOfFrag,
		getImagesOfFragment => \&getImagesOfFragment,
		requestImagesOfInstFragments => \&requestImagesOfInstFragments,
		getInstitutionArtefacts => \&getInstitutionArtefacts,
		getScrollWidth => \&getScrollWidth,
		getScrollHeight => \&getScrollHeight,
		newArtefact => \&newArtefact,
		getArtefactMask => \&getArtefactMask,
		getScrollArtefacts => \&getScrollArtefacts,
		newCombination => \&newCombination,
		copyCombination => \&copyCombination,
		nameCombination => \&nameCombination,
    removeCombination => \&removeCombination,
    addArtefact => \&addArtefact,
    removeArtefact => \&removeArtefact,
    changeArtefactShape => \&changeArtefactShape,
    changeArtefactPosition => \&changeArtefactPosition,
    changeArtefactData => \&changeArtefactData,
		changeArtefactPoly => \&changeArtefactPoly,
		setArtPosition => \&setArtPosition,
		setArtRotation => \&setArtRotation,
		addSigns => \&addSigns,
		removeSigns => \&removeSigns,
		addSignAttribute => \&addSignAttribute,
		removeSignAttribute => \&removeSignAttribute,
		addSignCharVariant => \&addSignCharVariant,
		removeSignChar => \&removeSignChar,
		addSignCharAttributeCommentary => \&addSignCharAttributeCommentary,
		removeSignCharAttributeCommentary => \&removeSignCharAttributeCommentary,
    getSignCharAttributeCommentary => \& getSignCharAttributeCommentary,
		addRoiToScroll => \&addRoiToScroll,
		removeROI => \&removeROI,
		requestRoiOfCol => \&requestRoiOfCol,
		getRoisOfCombination => \&getRoisOfCombination,
		requestTextOfFragment => \&requestTextOfFragment,
    changeColName => \&changeColName,
    changeCombinationName => \&changeCombinationName,
    requestListOfAttributes => \&requestListOfAttributes
	);
	my $json_post = $cgi->{CGIDATA};

	if (!defined $json_post->{transaction}){
		if (!defined $json_post->{requests}){
			print encode_json({'error', "No requests made."});
		} else {
			if (is_arrayref($json_post->{requests})) {
				print '{"replies":[';
				my $counter = 1;
				my $repeatLength = scalar @{$json_post->{requests}};
				foreach my $request (@{$json_post->{requests}}) {
					if (defined $request->{transaction} && defined $actions{$request->{transaction}}) {
						$actions{$request->{transaction}}->($cgi, $request);
					} else {
						print encode_json({[{'error' => "Transaction type '" . $request->{transaction} . "' not understood."}]});
					}
					if ($counter < $repeatLength) {
						$counter++;
						print ",";
					}
				}
				print ']}';
			} elsif (is_hashref($json_post->{requests})){
				print '{"replies":{';
				my $counter = 1;
				my $repeatLength = scalar keys %{$json_post->{requests}};
				my $lastItem = 1;
				while (my ($key, $value) = each (%{$json_post->{requests}})) {
					print "\"$key\":";
					if (defined $value->{transaction} && defined $actions{$value->{transaction}}) {
						$actions{$value->{transaction}}->($cgi, $value);
					} else {
						print "{'error': 'Transaction type $value->{transaction} not understood.'}";
					}
					if ($counter < $repeatLength) {
						$counter++;
						print ",";
					}
				}
				print '}}';
			}
		}
	} else {
		if (defined $json_post->{transaction} && defined $actions{$json_post->{transaction}}) {
			$actions{$json_post->{transaction}}->($cgi, $json_post);
		} else {
			print encode_json({'error', "Transaction type '" . $json_post->{transaction} . "' not understood."});
		}
	}
}
 
# General purpose DB subroutines
sub readResults {
	my ($sql) = @_;
	my @fetchedResults = ();
	while (my $result = $sql->fetchrow_hashref){
       	push @fetchedResults, $result;
    }
    if (scalar(@fetchedResults) > 0) {
		print "{\"results\":";
		print Encode::decode('utf8', encode_json(\@fetchedResults));
		print "}";
 	} else {
		print "{\"error\":\"No results found.\"}";
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
	my ($cgi) = @_;
	my $dbh = $cgi->dbh;

	$cgi->print('{"SESSION_ID":"'.$cgi->session_id.'", "USER_ID":'.$dbh->user_id.'}');
	return;
}

sub requestCombs {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $getCombsQuery = <<'MYSQL';
SELECT DISTINCT 
       scroll_data.scroll_id as scroll_id,
       scroll_data.name AS name,
       scroll_version.scroll_version_id AS scroll_version_id,
       scroll_data.scroll_data_id AS scroll_data_id,
       scroll_version_group.locked,
			scroll_version.user_id
FROM scroll_version
	JOIN scroll_version_group USING(scroll_version_group_id)
	JOIN scroll_data_owner using(scroll_version_id)
	JOIN scroll_data using(scroll_data_id)
WHERE scroll_version.user_id = ?
	OR scroll_version.user_id = 1
ORDER BY scroll_version.user_id DESC, LPAD(SPLIT_STRING(name, "Q", 1), 3, "0"),
	LPAD(SPLIT_STRING(name, "Q", 2), 3, "0")
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getCombsQuery) or die
			"{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{user_id});

	readResults($sql, $key, $lastItem);
	return;
}

sub getImages {
	my ($cgi, $json_post) = @_;
	my $getImagesQuery = <<'MYSQL';
 SELECT DISTINCT image_catalog.catalog_number_1 AS lvl1,
		image_catalog.catalog_number_2 AS lvl2,
		image_catalog.catalog_side AS side,
		image_catalog.institution,
		image_catalog.image_catalog_id AS image_catalog_id,
		SQE_image.sqe_image_id AS master_sqe_image_id
  FROM image_catalog
  LEFT JOIN SQE_image USING(image_catalog_id)
  WHERE SQE_image.is_master = 1 OR SQE_image.is_master IS NULL
  ORDER BY lvl1, lvl2, side
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getImagesQuery) or die
			"{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute();

	readResults($sql);
	return;
}

sub requestArtOfComb {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $getColOfCombQuery = <<'MYSQL';
SELECT DISTINCT artefact.artefact_id AS artefact_id,
  artefact_data.name,
  artefact_data_owner.scroll_version_id,
  SQE_image.image_catalog_id AS image_catalog_id,
  SQE_image.sqe_image_id AS id_of_sqe_image,
  image_catalog.catalog_side AS catalog_side
FROM artefact
	JOIN artefact_data USING(artefact_id)
  JOIN artefact_data_owner USING(artefact_data_id)
  JOIN artefact_shape USING(artefact_id)
  JOIN artefact_shape_owner USING(artefact_shape_id)
  JOIN SQE_image ON SQE_image.sqe_image_id = artefact_shape.id_of_sqe_image
  JOIN image_catalog USING(image_catalog_id)
WHERE artefact_data_owner.scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getColOfCombQuery) or die
		"{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{scroll_version_id});

	readResults($sql, $key, $lastItem);
	return;
}

sub requestArtOfImage {
	my ($cgi, $json_post) = @_;
	my $requestArtOfImageQuery = <<'MYSQL';
SELECT DISTINCT	artefact_position.artefact_position_id AS artefact_position_id,
				artefact_shape.artefact_shape_id AS artefact_shape_id,
				artefact_position.artefact_id AS artefact_id,
				artefact_data.name, 
				catalog_side AS side,
				ST_AsText(artefact_shape.region_in_sqe_image) as mask,
				artefact_position.transform_matrix,
				ST_AsText(ST_Envelope(artefact_shape.region_in_sqe_image)) AS rect,
				SQE_image.image_catalog_id,
        SQE_image.sqe_image_id AS id_of_sqe_image,
        artefact_data_owner.scroll_version_id
FROM artefact_shape
	JOIN artefact_shape_owner USING(artefact_shape_id)
	JOIN artefact_position USING(artefact_id)
	JOIN artefact_position_owner USING(artefact_position_id)
	JOIN artefact_data USING(artefact_id)
	JOIN artefact_data_owner USING(artefact_data_id)
	JOIN SQE_image ON SQE_image.sqe_image_id = artefact_shape.id_of_sqe_image
	JOIN image_catalog USING(image_catalog_id)
WHERE SQE_image.image_catalog_id = ?
      AND artefact_shape_owner.scroll_version_id = ?
			AND artefact_position_owner.scroll_version_id = ?
      AND artefact_data_owner.scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($requestArtOfImageQuery) or die
		"{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{image_catalog_id}, $json_post->{scroll_version_id}, $json_post->{scroll_version_id}, $json_post->{scroll_version_id});

	readResults($sql);
	return;
}

sub requestImgOfComb {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $getColOfCombQuery = <<'MYSQL';
SELECT DISTINCT image_catalog.catalog_number_1 AS lvl1,
    image_catalog.catalog_number_2 AS lvl2,
    image_catalog.catalog_side AS side,
    image_catalog.institution,
    image_catalog.image_catalog_id AS image_catalog_id,
    scroll_version.scroll_version_id AS scroll_version_id,
    SQE_image.sqe_image_id AS master_sqe_image_id
FROM image_catalog
  JOIN image_to_edition_catalog USING (image_catalog_id)
  JOIN edition_catalog USING (edition_catalog_id)
  JOIN scroll_version_group USING(scroll_id)
  JOIN scroll_version USING(scroll_version_group_id)
  LEFT JOIN SQE_image USING(image_catalog_id)
  LEFT JOIN artefact_shape ON artefact_shape.id_of_sqe_image = SQE_image.sqe_image_id
  LEFT JOIN artefact_shape_owner USING(artefact_shape_id)
WHERE (scroll_version.scroll_version_id = ?
  OR artefact_shape_owner.scroll_version_id = ?)
  AND (SQE_image.is_master = 1 OR SQE_image.is_master IS NULL) 
ORDER BY lvl1, lvl2, side
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getColOfCombQuery) or die
		"{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{scroll_version_id}, $json_post->{scroll_version_id});

	readResults($sql, $key, $lastItem);
	return;
}

sub requestColOfComb {
	my ($cgi, $json_post) = @_;
  my $cols = $cgi->get_cols_for_scrollversion($json_post->{scroll_version_id});
  print "{\"results\":$cols}";
	return;
}

sub getSignStreamOfColumn {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $getScrollsQuery = << 'MYSQL';
SELECT
	col_data.name AS col_name,
	col_data.col_id AS col_id,
	line_data.name AS line_name,
	line_data.line_id AS line_id,
	position_in_stream.sign_id,
	position_in_stream.next_sign_id,
	sign_char.sign_char_id,
	sign_char.is_variant,
	sign_char.sign,
	sign_char_attribute.sequence,
	attribute.name AS attribute_name,
	attribute.type,
	attribute.description AS attribute_description,
	attribute_numeric.value,
	attribute_value.string_value,
	attribute_value.description AS attribute_value_description,
	attribute_value_css.css,
	sign_char_commentary.commentary
FROM col_to_line
	JOIN col_to_line_owner USING(col_to_line_id)
	JOIN col_data USING(col_id)
	JOIN col_data_owner USING(col_data_id)
	JOIN line_to_sign USING(line_id)
	JOIN line_to_sign_owner USING(line_to_sign_id)
	JOIN line_data USING(line_id)
	JOIN line_data_owner USING(line_data_id)
	JOIN position_in_stream USING(sign_id)
	JOIN position_in_stream_owner USING(position_in_stream_id)
	JOIN sign_char USING(sign_id)
	LEFT JOIN sign_char_attribute USING(sign_char_id)
	JOIN sign_char_attribute_owner USING(sign_char_attribute_id)
	LEFT JOIN attribute_numeric USING(sign_char_attribute_id)
	JOIN attribute_value USING(attribute_value_id)
	LEFT JOIN attribute_value_css USING(attribute_value_id)
	JOIN attribute USING(attribute_id)
	LEFT JOIN sign_char_commentary USING(sign_char_id)
WHERE col_to_line.col_id = ?
      AND position_in_stream_owner.scroll_version_id = ?
      AND line_data_owner.scroll_version_id = ?
      AND line_to_sign_owner.scroll_version_id = ?
      AND col_data_owner.scroll_version_id = ?
      AND col_to_line_owner.scroll_version_id = ?
      AND sign_char_attribute_owner.scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare($getScrollsQuery) or die
		"{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute(
		$json_post->{colId},
		$json_post->{SCROLL_VERSION},
		$json_post->{SCROLL_VERSION},
		$json_post->{SCROLL_VERSION},
		$json_post->{SCROLL_VERSION},
		$json_post->{SCROLL_VERSION},
		$json_post->{SCROLL_VERSION});

	readResults($sql, $key, $lastItem);
	return;
}

sub getSignStreamOfFrag {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	print "{";
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	$cgi->get_text_of_fragment($json_post->{col_id},"SQE_Format::JSON");
	print "}";
	return;
}

# This is not well tested, and it will fail often.
# This is skipped in the server unit tests.
sub getImagesOfFragment {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $sql;
	my $idType = $json_post->{idType};
	my $getImagesOfFragmentQuery = <<'MYSQL';
SELECT * 
FROM image_to_edition_catalog
  JOIN edition_catalog USING(edition_catalog_id)
  JOIN scroll_to_col USING(scroll_id)
  JOIN col_data USING(col_id)
  JOIN col_data_owner USING(col_data_id)
WHERE (
  scroll_version_id = ? 
  AND col_id = ?
) AND
(
  REPLACE(name, 'frg. ', '') = edition_location_2 
  OR  CONCAT(
        CAST(
          fromRoman(
            REGEXP_REPLACE(edition_location_1 COLLATE utf8_bin,'[^A-Z]','')
          ) 
          AS CHAR(20)
        ), 
        edition_location_2
      ) 
      LIKE REPLACE(name, 'col. ', '') 
)
MYSQL

	$sql = $cgi->dbh->prepare_cached($getImagesOfFragmentQuery)
		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{scroll_version_id}, $json_post->{col_id});

	readResults($sql, $key, $lastItem);
	return;
}

sub requestImagesOfInstFragments {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $getInstitutionFragmentsQuery = <<'MYSQL';
SELECT DISTINCT	SQE_image.sqe_image_id,
				SQE_image.filename AS filename,
				SQE_image.dpi AS dpi,
				SQE_image.wavelength_start AS start,
				SQE_image.wavelength_end AS end,
				SQE_image.is_master,
				SQE_image.native_width AS width,
				SQE_image.native_height AS height,
				SQE_image.type AS type,
				image_urls.url AS url,
				image_urls.suffix AS suffix,
				edition_catalog.edition_side,
        image_catalog_id
FROM SQE_image
	JOIN image_urls USING(image_urls_id)
	LEFT JOIN SQE_image_to_edition_catalog USING(sqe_image_id)
	LEFT JOIN edition_catalog USING(edition_catalog_id)
WHERE image_catalog_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getInstitutionFragmentsQuery)
		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{image_catalog_id});

	readResults($sql, $key, $lastItem);
	return;
}

sub getInstitutionArtefacts {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $getInstitutionArtefactsQuery = <<'MYSQL';
		SELECT DISTINCT artefact_shape.artefact_id,
			user_id
		FROM artefact_shape
			JOIN SQE_image ON SQE_image.sqe_image_id = artefact_shape.id_of_sqe_image
			JOIN artefact_shape_owner USING(artefact_shape_id)
			JOIN scroll_version USING(scroll_version_id)
		WHERE SQE_image.image_catalog_id = ?
			  AND user_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getInstitutionArtefactsQuery)
		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{image_catalog_id}, $json_post->{user_id});

	readResults($sql, $key, $lastItem);
	return;
}

sub getScrollWidth {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $getScrollWidthQuery = <<'MYSQL';
	SELECT  artefact_id, 
          MAX(
            JSON_EXTRACT(transform_matrix, '$.matrix[0][2]') 
            + (
              (ST_X(ST_PointN(ST_ExteriorRing(ST_ENVELOPE(region_in_sqe_image)), 2)) 
              - ST_X(ST_PointN(ST_ExteriorRing(ST_ENVELOPE(region_in_sqe_image)), 1))
            ) 
            * (1215 / SQE_image.dpi))
          ) 
          AS max_x 
  FROM artefact_position 
    JOIN artefact_position_owner USING(artefact_position_id) 
    JOIN artefact_shape USING(artefact_id) 
    JOIN artefact_shape_owner USING(artefact_shape_id) 
    JOIN SQE_image ON SQE_image.sqe_image_id = artefact_shape.id_of_sqe_image
    JOIN image_catalog USING(image_catalog_id) 
  WHERE artefact_position_owner.scroll_version_id = ? 
    AND artefact_shape_owner.scroll_version_id = ? 
    AND image_catalog.catalog_side=0
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getScrollWidthQuery)
		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{scroll_version_id}, $json_post->{scroll_version_id});

	readResults($sql, $key, $lastItem);
	return;
}

sub getScrollHeight {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $getScrollHeightQuery = <<'MYSQL';
	SELECT  artefact_id, 
          MAX(
            JSON_EXTRACT(transform_matrix, '$.matrix[1][2]') 
            + (
              (ST_Y(ST_PointN(ST_ExteriorRing(ST_ENVELOPE(region_in_sqe_image)), 3)) 
              - ST_Y(ST_PointN(ST_ExteriorRing(ST_ENVELOPE(region_in_sqe_image)), 1))
            ) 
            * (1215 / SQE_image.dpi))
          ) 
          AS max_y 
  FROM artefact_position 
    JOIN artefact_position_owner USING(artefact_position_id) 
    JOIN artefact_shape USING(artefact_id) 
    JOIN artefact_shape_owner USING(artefact_shape_id) 
    JOIN SQE_image ON SQE_image.sqe_image_id = artefact_shape.id_of_sqe_image
    JOIN image_catalog USING(image_catalog_id) 
  WHERE artefact_position_owner.scroll_version_id = ? 
    AND artefact_shape_owner.scroll_version_id = ? 
    AND image_catalog.catalog_side=0
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getScrollHeightQuery)
		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{scroll_version_id}, $json_post->{scroll_version_id});

	readResults($sql, $key, $lastItem);
	return;
}

sub getArtefactMask {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $addArtToCombQuery = <<'MYSQL';
SELECT ST_AsText(region_in_sqe_image) AS mask,
	transform_matrix,
  artefact_shape_owner.scroll_version_id AS scroll_version_id,
	ST_AsText(ST_Envelope(region_in_sqe_image)) AS rect
	FROM artefact_shape
	JOIN artefact_shape_owner USING(artefact_shape_id)
	JOIN artefact_position USING(artefact_id)
	JOIN artefact_position_owner USING(artefact_position_id)
	WHERE artefact_id = ?
		AND artefact_shape_owner.scroll_version_id = ?
		AND artefact_position_owner.scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($addArtToCombQuery)
		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{artefact_id}, $json_post->{scroll_version_id}, $json_post->{scroll_version_id});

	readResults($sql, $key, $lastItem);
	return;
}

sub getScrollArtefacts {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $getScrollArtefactsQuery = <<'MYSQL';
SELECT DISTINCT artefact_position.artefact_position_id AS artefact_position_id,
				artefact_shape.artefact_shape_id AS artefact_shape_id,
				artefact_position.artefact_id AS artefact_id,
                ST_AsText(ST_Envelope(artefact_shape.region_in_sqe_image)) AS rect,
                ST_AsText(artefact_shape.region_in_sqe_image) AS mask,
				artefact_position.transform_matrix AS transform_matrix,
                image_urls.url AS url,
                image_urls.suffix AS suffix,
                SQE_image.filename AS filename,
                SQE_image.dpi AS dpi,
                image_catalog.catalog_side AS side,
        artefact_data.name AS name,
        artefact_data.artefact_data_id,
				SQE_image.image_catalog_id,
        SQE_image.sqe_image_id AS id_of_sqe_image,
        artefact_shape_owner.scroll_version_id AS scroll_version_id
FROM artefact_position_owner
	JOIN artefact_position USING(artefact_position_id)
	JOIN artefact_shape USING(artefact_id)
	JOIN artefact_shape_owner USING(artefact_shape_id)
	JOIN artefact_data USING(artefact_id)
	JOIN artefact_data_owner USING(artefact_data_id)
	INNER JOIN SQE_image ON SQE_image.sqe_image_id = artefact_shape.id_of_sqe_image
	INNER JOIN image_urls USING(image_urls_id)
	INNER JOIN image_catalog USING(image_catalog_id)
WHERE artefact_position_owner.scroll_version_id=?
	  AND artefact_shape_owner.scroll_version_id=?
	  AND artefact_data_owner.scroll_version_id=?
      AND image_catalog.catalog_side=0
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getScrollArtefactsQuery)
		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{scroll_version_id}, $json_post->{scroll_version_id}, $json_post->{scroll_version_id});

	readResults($sql, $key, $lastItem);
	return;
}

# sub newCombination {
# 	my ($cgi, $json_post, $key, $lastItem) = @_;
# 	my $user_id = $cgi->dbh->user_id;
# 	my $name = $json_post->{name}; 

# 	my $newScroll = <<'MYSQL';
# 		INSERT INTO scroll ()
# 		VALUES()
# MYSQL
# 	my $sql = $cgi->dbh->prepare_cached($newScroll)
# 		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
# 	$sql->execute();
# 	my $scroll_id = $cgi->dbh->last_insert_id(undef, undef, undef, undef);

# 	my $newScrollVersion = <<'MYSQL';
# 		INSERT INTO scroll_version (user_id, scroll_id, version)
# 		VALUES(?, ?, 0)
# MYSQL
# 	$sql = $cgi->dbh->prepare_cached($newScrollVersion)
# 		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
# 	$sql->execute($user_id, $scroll_id);
# 	my $scroll_version_id = $cgi->dbh->last_insert_id(undef, undef, undef, undef);

# 	my $newScrollData = <<'MYSQL';
# 		INSERT INTO scroll_data (name, scroll_id)
# 		VALUES(?, ?)
# MYSQL
# 	$sql = $cgi->dbh->prepare_cached($newScrollData)
# 		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
# 	$sql->execute($name, $scroll_id);
# 	my $scroll_data_id = $cgi->dbh->last_insert_id(undef, undef, undef, undef);

# 	my $newScrollDataOwner = <<'MYSQL';
# 		INSERT INTO scroll_data_owner (scroll_data_id, scroll_version_id)
# 		VALUES(?, ?)
# MYSQL
# 	$sql = $cgi->dbh->prepare_cached($newScrollDataOwner)
# 		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
# 	$sql->execute($scroll_data_id, $scroll_version_id);

# 	print '{"created": {"scroll_data": ' . $scroll_data_id . ', "scroll_version":' . $scroll_version_id . '}}';
# 	return;
# }

sub copyCombination {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	print "{\"set_scroll_version\": ";
	my ($sv, $error) = $cgi->set_scrollversion($json_post->{scroll_version_id});
	handleDBError ($sv, $error);
	my $clonedScroll = $cgi->clone_scrollversion();
	print ",\"new_scroll_id\": $clonedScroll, \"scroll_data\":";

	my $getCombsQuery = <<'MYSQL';
SELECT DISTINCT 
  scroll_data.scroll_id AS scroll_id,
  scroll_data.name AS name,
  scroll_version.scroll_version_id AS scroll_version_id,
  scroll_data.scroll_data_id AS scroll_data_id,
  scroll_version_group.locked,
  scroll_version.user_id
FROM scroll_version
  JOIN scroll_version_group USING(scroll_version_group_id)
  JOIN scroll_data_owner USING(scroll_version_id)
  JOIN scroll_data using(scroll_data_id)
WHERE scroll_version.scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getCombsQuery) or die
			"{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($clonedScroll);
  readResults($sql);
	print "}";
}

sub nameCombination {
	my ($cgi, $json_post) = @_;
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

sub removeCombination {
  my ($cgi, $json_post) = @_;
  $cgi->delete_scrollversion($json_post->{scroll_version_id});
  print '{"' . $json_post->{scroll_version_id} . '": "deleted"}'
}

sub addArtefact {
  my ($cgi, $json_post) = @_;
  $cgi->set_scrollversion($json_post->{scroll_version_id});
  my ($artefact_id, $error) = $cgi->add_artefact($json_post->{id_of_sqe_image}, $json_post->{region_in_master_image});
  handleDBError ($artefact_id, $error);
  # print '{"artefact_id":"' . $artefact_id . '"}';
}

sub removeArtefact {
  my ($cgi, $json_post) = @_;
  $cgi->set_scrollversion($json_post->{scroll_version_id});
  $cgi->remove_artefact($json_post->{artefact_id});
  print '{"' . $json_post->{artefact_id} . '":"deleted","scroll_version_id":"' . $json_post->{scroll_version_id} . '"}';
}

sub changeArtefactShape{
  my ($cgi, $json_post) = @_;
  $cgi->set_scrollversion($json_post->{scroll_version_id});
  $cgi->change_artefact_shape($json_post->{artefact_id}, $json_post->{id_of_sqe_image}, $json_post->{region_in_master_image});
  print '{"' . $json_post->{artefact_id} . '":"changed shape","region_in_master_image":"' . $json_post->{region_in_master_image} . '","scroll_version_id":"' . $json_post->{scroll_version_id} . '"}';
}
sub changeArtefactPosition{
  my ($cgi, $json_post) = @_;
  $cgi->set_scrollversion($json_post->{scroll_version_id});
  $cgi->change_artefact_position($json_post->{artefact_id}, $json_post->{transform_matrix}, $json_post->{z_index});
  print '{"' . $json_post->{artefact_id} . '":"changed position","scroll_version_id":"' . 
    $json_post->{scroll_version_id} . '"}';
}

sub changeArtefactData{
  my ($cgi, $json_post) = @_;
  $cgi->set_scrollversion($json_post->{scroll_version_id});
  $cgi->change_artefact_data($json_post->{artefact_id}, $json_post->{name});
  print '{"' . $json_post->{artefact_id} . '":"changed name","name":"' . 
    $json_post->{name} . '","scroll_version_id":"' . 
    $json_post->{scroll_version_id} . '"}';
}

sub addSigns() {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $counter = 1;
	my $repeatLength = scalar @{$json_post->{signs}};
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	print "[{";

	my $prev_sign_id = 0;
	my $next_sign_id = $json_post->{signs}->[-1]->{next_sign_id};
	foreach my $sign (@{$json_post->{signs}}) {
		if ($counter == 1) {
			$prev_sign_id = $sign->{previous_sign_id};
		}
		if (scalar @{$sign->{attribute_value_ids}} > 0) {
			$prev_sign_id = $cgi->insert_sign($sign->{sign}, $prev_sign_id, $next_sign_id, @{$sign->{attribute_value_ids}});
		} else {
			$prev_sign_id = $cgi->insert_sign($sign->{sign}, $prev_sign_id, $next_sign_id);
		}
		print "\"$sign->{uuid}\":{\"sign_id\":$prev_sign_id";
		
		# Now let's grab the new sign_char_id as well.
		my $signCharQuery = <<'MYSQL';
		SELECT sign_char_id
		FROM sign_char
		WHERE sign_id = ?
MYSQL
		my $sql = $cgi->dbh->prepare_cached($signCharQuery) or die
				",\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
		$sql->execute($prev_sign_id);
		
		#TODO: we need to also grab all sign_char_attribute_ids as an array.
		while (my $result = $sql->fetchrow_hashref){
			my $new_id = $result->{sign_char_id};
			# if ($sign->{attribute_value_ids} > 1) {
   #  		my $attr_id = $cgi->set_sign_char_attribute(
			# 		$new_id, 
			# 		$sign->{attribute_value_ids});
			# }
			print ",\"sign_char_id\":$new_id}";
    }
		 	
		
		if ($counter != $repeatLength) {
			print "},{";
			$counter++;
		}
	}

	print "}]";
}

sub removeSigns {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $counter = 1;
	my $repeatLength = scalar @{$json_post->{sign_id}};
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	print "[{";

	foreach my $sign_id (@{$json_post->{sign_id}}) {
		$cgi->remove_sign($sign_id);
		print "\"$sign_id\":\"deleted\"";
		if ($counter != $repeatLength) {
			print "},{";
			$counter++;
		}
	}

	print "}]";
}

sub addSignAttribute() {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $counter = 1;
	my $repeatLength = scalar @{$json_post->{signs}};
	$cgi->set_scrollversion($json_post->{scroll_version_id});

	if (defined $key) {
		print "\"$key\":";
	} else {
		print "{\"results\":";
	}
	print "[";

	foreach my $sign (@{$json_post->{signs}}) {
		print "{\"$sign->{sign_char_id}\":[";
		my $attributeCounter = 1;
		my $attributeRepeatLength = scalar @{$sign->{attributes}};
		foreach my $attribute (@{$sign->{attributes}}) {
      my $attribute_numeric_value = $attribute->{attribute_numeric_value} ? $attribute->{attribute_numeric_value} : "null";
			my $new_id = $cgi->set_sign_char_attribute(
				$sign->{sign_char_id}, 
				$attribute->{attribute_value_id}, 
				$attribute->{attribute_numeric_value});
			print "{\"$new_id\": {\"attribute_value\": \"$attribute->{attribute_value_id}\", \"numeric_value\": $attribute_numeric_value, \"sequence\": \"$attribute->{sequence})\"}}";
			if ($attributeCounter != $attributeRepeatLength) {
				print ",";
				$attributeCounter++;
			}
		}
		print "]}";
		if ($counter != $repeatLength) {
			print ",";
			$counter++;
		}
	}
	print "]";
	if (!defined $key) {
		print("}");
	} elsif (!$lastItem) {
		print(",");
	}
}

sub removeSignAttribute() {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $counter = 1;
	my $repeatLength = scalar @{$json_post->{signs}};
	$cgi->set_scrollversion($json_post->{scroll_version_id});

	if (defined $key) {
		print "\"$key\":";
	} else {
		print "{\"results\":";
	}
	print "[{";

	foreach my $sign (@{$json_post->{signs}}) {
		print "\"$sign->{sign_char_id}\":[";
		my $attributeCounter = 1;
		my $attributeRepeatLength = scalar @{$sign->{attributes}};
		foreach my $attribute (@{$sign->{attributes}}) {
			$cgi->remove_sign_char_attribute(
				$attribute->{sign_char_attribute_id});
			print "{\"$attribute->{sign_char_attribute_id}\": \"deleted\"}";
			if ($attributeCounter != $attributeRepeatLength) {
				print ",";
				$attributeCounter++;
			}
		}
		print "]}";
		if ($counter != $repeatLength) {
			print "},{";
			$counter++;
		}
	}
	print "]}";
}

#Give a sign_id, a character with the variant reading, and a 1 if it should be the main reading.
#I don't know yet what it returns.
sub addSignCharVariant() {
	my ($cgi, $json_post) = @_;
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	$cgi->add_sign_char_variant($json_post->{sign_id}, $json_post->{character}, $json_post->{main});
}

#Give a sign_char_id.
#I don't know yet what it returns.
sub removeSignChar() {
	my ($cgi, $json_post) = @_;
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	$cgi->remove_sign_char($json_post->{sign_char_id});
}

#Give a sign_char_id, an attribute_id, and a comment.
#I don't know yet what it returns.
sub addSignCharAttributeCommentary() {
	my ($cgi, $json_post) = @_;
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	my $new_sign_char_commentary_id = $cgi->set_sign_char_commentary($json_post->{sign_char_id}, $json_post->{attribute_id}, $json_post->{commentary});
  print '{"new_sign_char_commentary_id":' . "$new_sign_char_commentary_id}";
}

#Give a sign_char_commentary_id.
#I don't know yet what it returns.
sub removeSignCharAttributeCommentary() {
	my ($cgi, $json_post) = @_;
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	$cgi->remove_sign_char_commentary($json_post->{sign_char_commentary_id});
  print "{\"$json_post->{sign_char_commentary_id}\":\"deleted\"}";
}

#Give a sign_char_commentary_id.
#It returns the text of the comment.
sub getSignCharAttributeCommentary() {
	my ($cgi, $json_post) = @_;
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	my $comment = $cgi->get_sign_char_commentary($json_post->{sign_char_commentary_id});
  if (defined $comment) {
    my %response = (
      "$json_post->{sign_char_commentary_id}" => "$comment"
    );
    print Encode::decode('utf8', encode_json(\%response));
  }
}

#Give the sign_char_id, a GEOJSON poly, a JSON transform_matrix for the position,
#a values_set to tell it a human meant to set the value, and I am not sure what exceptional
#is for.  If you don't provide a sign_char_id, the subroutine automatically gets the lowest
#sign_char_id in the selected scroll.  I don't know yet what it returns.
sub addRoiToScroll() {
	my ($cgi, $json_post) = @_;
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	my $sign_char_id;
	if (!defined $json_post->{sign_char_id}) {
		my $sqlQuery = <<'MYSQL';
SELECT MIN(sign_char_id) as sign_char_id
FROM sign_char
JOIN position_in_stream USING (sign_id)
JOIN position_in_stream_owner USING (position_in_stream_id)
WHERE position_in_stream_owner.scroll_version_id = ?
MYSQL
	my $sql = $cgi->dbh->prepare_cached($sqlQuery)
		or die "{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{scroll_version_id});
	$sign_char_id = $sql->fetchrow_arrayref()->[0];
	} else {
		$sign_char_id = $json_post->{sign_char_id};
	}
	$cgi->add_roi(
		$sign_char_id, 
		$json_post->{path}, 
		$json_post->{transform_matrix}, 
		$json_post->{values_set}, 
		$json_post->{exceptional}
	);
	print "{\"sign_char_id\": $sign_char_id}";
}

#Give a sign_char_roi_id.
#I don't know yet what it returns.
sub removeROI() {
	my ($cgi, $json_post) = @_;
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	$cgi->remove_roi($json_post->{sign_char_roi_id});
}

sub requestRoiOfCol() {
	my ($cgi, $json_post) = @_;

	my $sqlQuery = <<'MYSQL';
SELECT sign_char_roi_id, sign_char_id, ST_AsWKT(path) AS path, transform_matrix
	FROM sign_char_roi
JOIN sign_char_roi_owner USING(sign_char_roi_id)
JOIN roi_shape USING(roi_shape_id)
JOIN roi_position USING(roi_position_id)
JOIN sign_char USING(sign_char_id)
JOIN line_to_sign USING(sign_id)
JOIN line_to_sign_owner USING(line_to_sign_id)
JOIN col_to_line USING(line_id)
JOIN col_to_line_owner USING(col_to_line_id)
WHERE col_to_line.col_id = ?
	AND sign_char_roi_owner.scroll_version_id = ?
	AND line_to_sign_owner.scroll_version_id = ?
	AND col_to_line_owner.scroll_version_id = ?
MYSQL

	my $sql = $cgi->dbh->prepare_cached($sqlQuery) or die
		"{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{col_id}, $json_post->{scroll_version_id}, $json_post->{scroll_version_id}, $json_post->{scroll_version_id});

	readResults($sql);
	return;
}

sub getRoisOfCombination() {
	my ($cgi, $json_post) = @_;

	my $sqlQuery = <<'MYSQL';
SELECT sign_char_roi_id, sign_char_id, ST_AsWKT(path) AS path, transform_matrix
	FROM sign_char_roi
JOIN sign_char_roi_owner USING(sign_char_roi_id)
JOIN roi_shape USING(roi_shape_id)
JOIN roi_position USING(roi_position_id)
JOIN sign_char USING(sign_char_id)
JOIN line_to_sign USING(sign_id)
JOIN line_to_sign_owner USING(line_to_sign_id)
JOIN col_to_line USING(line_id)
JOIN col_to_line_owner USING(col_to_line_id)
JOIN scroll_to_col USING(col_id)
JOIN scroll_to_col_owner USING(scroll_to_col_id)
WHERE scroll_to_col.scroll_id = ?
	AND sign_char_roi_owner.scroll_version_id = ?
	AND line_to_sign_owner.scroll_version_id = ?
	AND col_to_line_owner.scroll_version_id = ?
	AND scroll_to_col_owner.scroll_version_id = ?
MYSQL

	my $sql = $cgi->dbh->prepare_cached($sqlQuery) or die
		"{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute($json_post->{scroll_id}, $json_post->{scroll_version_id}, $json_post->{scroll_version_id}, $json_post->{scroll_version_id}, $json_post->{scroll_version_id});

	readResults($sql);
	return;
}

sub requestTextOfFragment() {
	my ($cgi, $json_post) = @_;
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	print "{";
	$cgi->get_text_of_fragment($json_post->{col_id}, 'SQE_Format::JSON');
	print "}";
}

# This seems to run without error, but the relevant data
# is not inserted.

sub changeColName() {
	my ($cgi, $json_post) = @_;
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	$cgi->change_col_name($json_post->{col_id}, $json_post->{name});
  print '{"col_id":' . $json_post->{col_id} . 
    ',"name":"' . $json_post->{name} . 
    '","scroll_version_id":' . $json_post->{scroll_version_id} . '}';
}

# This needs to be added to the SQE_DB_API.

sub changeCombinationName() {
	my ($cgi, $json_post) = @_;
	$cgi->set_scrollversion($json_post->{scroll_version_id});
	$cgi->change_scroll_name($json_post->{name});
  print '{"name":"' . $json_post->{name} . 
    '","scroll_version_id":' . $json_post->{scroll_version_id} . '}';
}

sub requestListOfAttributes() {
	my ($cgi, $json_post, $key, $lastItem) = @_;
	my $getAttrsQuery = <<'MYSQL';
SELECT	attribute.attribute_id, 
				attribute_value_id, 
				string_value AS attribute_value_name,
				attribute_value.description AS attribute_value_description, 
				attribute.name AS attribute_name, 
				attribute.description AS attribute_description, 
				type
FROM attribute_value
JOIN attribute USING(attribute_id)
MYSQL
	my $sql = $cgi->dbh->prepare_cached($getAttrsQuery) or die
			"{\"Couldn't prepare statement\":\"" . $cgi->dbh->errstr . "\"}";
	$sql->execute();

	readResults($sql, $key, $lastItem);
	return;
}

processCGI();
