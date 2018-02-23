package SQE_vectors;
use strict;
use warnings FATAL => 'all';
use JSON qw(encode_json decode_json);
use Math::Geometry::Planar;

# This takes a GeoJSON polygon string as input.
# The object should have the following format:
# {"type": "Polygon", "coordinates": [[[1375, 7255], [1380, 7260],...]]]}
# It returns a 3d array that is compatible
# with the other subroutines here.
sub geoJsonToArray {
	return \@{decode_json(shift)->{coordinates}};

}

# This takes a JSON string containing a
# transform matrix as input.  It returns
# the matrix in the form of a 2D array that
# is compatible with the other subroutines here.
# The JSON object should be formatted:
# {"matrix": [[1,0,0],[0,1,0]]}
sub jsonMatrixToArray {
	return \@{decode_json(shift)->{matrix}};
}

# Given a list of the points converted from a
# GeoJSON polygon object and a list containing
# a transform matrix, this subroutine transforms
# the polygon(s) in place.
sub transformGeoJson {
	my ($jsonPoly, $matrix) = @_;
	for (my $i = 0; $i < scalar @$jsonPoly; $i++) {
		_applyMatrixTransform(\@{@$jsonPoly[$i]}, \@$matrix);
	}
}

# This method takes as input a vector polygon and a transform matrix.
# It then transforms that vector polygon in place.
# The vector polygon should have the format:
# [[x, y], [x, y], ...]
# The transform matrix should have the format:
# ([1,0,0],[0,1,0])
# The system accounts for the non-symmetrical matrices, there is
# no need to enter a third row [0,0,1] into the transform matrix.
sub _applyMatrixTransform {
	my ($poly, $matrix) = @_;
	for (my $i = 0; $i < scalar @{$poly}; $i++) {
		splice @$poly[$i],
			0,
			2,
			(
				${@$poly[$i]}[0] * ${@$matrix[0]}[0] + ${@$poly[$i]}[1] * ${@$matrix[0]}[1] + ${@$matrix[0]}[2],
				${@$poly[$i]}[0] * ${@$matrix[1]}[0] + ${@$poly[$i]}[1] * ${@$matrix[1]}[1] + ${@$matrix[1]}[2]
			);
	}
}

# This subroutine takes two polygons of the format
# [[[1,1],[1,10],[10,10],[10,1]]]
# It will return of polygon equal the overlap.
# If there was no overlap it will return undef.
# So, simply test for undef.
sub testPolygonOverlap {
	my ($polygon1, $polygon2) = @_;

	my $contour1 = Math::Geometry::Planar->new;
	$contour1->polygons(@$polygon1);

	my $contour2 = Math::Geometry::Planar->new;
	$contour2->polygons(@$polygon2);

	return \Gpc2Polygons(GpcClip('INTERSECTION', $contour1->convert2gpc, $contour2->convert2gpc));
}
1;