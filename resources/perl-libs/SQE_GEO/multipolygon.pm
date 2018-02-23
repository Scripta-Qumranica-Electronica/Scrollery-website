package SQE_GEO::multipolygon;
use strict;
use warnings FATAL => 'all';


#@method
sub new {
    my $class=shift;
    my $self = bless {
            polygons=>[],
            min_x => 99999999e9,
            max_x => -9999999e9,
            min_y => 9999999e9,
            max_y => -9999999e9,
        }, $class;
    $self->add_polygon(@_);
    return $self;
}

#@method
sub add_polygon {
    my $self = shift;
    while (@_ > 0) {
        my $polygon = shift;
        $polygon->analyze;
        if (not defined $self->{polygons}->[0]) {
            ($self->{min_x}, $self->{max_x}, $self->{min_y}, $self->{max_y}) = $polygon->min_max;
        } else {
            $self->{min_x} = $polygon->{min_x} if $polygon->{min_x} < $self->{min_x};
            $self->{max_x} = $polygon->{max_x} if $polygon->{max_x} > $self->{max_x};
            $self->{min_y} = $polygon->{min_y} if $polygon->{min_y} < $self->{min_y};
            $self->{max_y} = $polygon->{max_y} if $polygon->{max_y} > $self->{max_y};
        }
        push @{$self->{polygons}}, $polygon;
    }
}

#@method
sub move_to_origin {
    my $self = shift;
    $self->move_by(-$self->{min_x}, -$self->{min_y});
    $self->{max_x} -= $self->{min_x};
    $self->{max_y} -= $self->{min_y};
    $self->{min_x} = 0;
    $self->{min_y} = 0;
}

#@method
sub flip {
    map {$_->flip} @{shift->{polygons}};
}

#@method
sub move_by {
    my ($self, $dx, $dy)=@_;
    foreach my $polygon (@{$self->{polygons}}) {
        $polygon->move_by($dx, $dy);
    }

}

#@method
sub as_SVG_string {
    my $self = shift;
    return join ("\n", map {$_->as_SVG_string} @{$self->{polygons}});
}

#@method
sub as_string {
    my $self = shift;
    return '(' . join (',', map {$_->as_string} @{$self->{polygons}}) . ')';
}

#@method
sub as_MULTIPOLYGON_string {
    my $self = shift;
    return 'MULTIPOLYGON' . $self->as_string;

}

#@method
sub width {
    my ($self) = @_;
    return ($self->{max_x} - $self->{min_x});
}

#@method
sub height {
    my ($self) = @_;
    return ($self->{max_y} - $self->{min_y});
}


1;