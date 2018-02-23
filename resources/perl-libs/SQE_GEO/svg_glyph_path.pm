package SQE_GEO::svg_glyph_path;
use strict;
use warnings FATAL => 'all';
use parent 'SQE_GEO::svg_path';

sub calculate_points {
    my $self=shift;
    $self->SUPER::calculate_points;
    map {$_->flip} @{$self->{polygons}};

}


1;