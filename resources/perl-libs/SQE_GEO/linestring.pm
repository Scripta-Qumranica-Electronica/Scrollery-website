package SQE_GEO::linestring;
use strict;
use warnings FATAL => 'all';
use SQE_DBI;
use Math::Round;

sub new {
    my $class = shift;
    my $self  = bless {
        x_values    => [],
        y_values    => [],
        max_x       => 0,
        max_x_index => 0,
        max_y       => 0,
        max_y_index => 0,
        min_x       => 0,
        min_x_index => 0,
        min_y       => 0,
        min_y_index => 0,
        dirty       => 1,
    }, $class;

    return $self;
}

sub add_points {
    my $self = shift;
    while ( @_ > 0 ) {
        push $self->{x_values}, shift;
        push $self->{y_values}, shift;
    }
    $self->{dirty} = 1;
}

sub get_point {
    my ( $self, $index ) = @_;
    return ( $self->{x_values}->[$index], $self->{y_values}->[$index] );
}

sub bounding_box {
    my $self = shift;
    return (
        ( $self->{min_x}, $self->{min_y} ),
        ( $self->{max_x}, $self->{min_y} ),
        ( $self->{min_x}, $self->{max_y} ),
        ( $self->{min_x}, $self->{max_y} )
    );
}

sub min_max {
    my $self = shift;
    return ( $self->{min_x}, $self->{max_x}, $self->{min_y}, $self->{max_y} );
}

sub analyze {
    my $self = shift;
    if ( $self->{dirty} == 1 ) {
        $self->{max_x} = $self->{max_y} = -999999e99;
        $self->{min_x} = $self->{min_y} = 999999e99;
        for ( my $i = 0 ; $i < @{ $self->{x_values} } ; $i++ ) {
#            $self->{x_values}->[$i] = round($self->{x_values}->[$i]);
#            $self->{y_values}->[$i] = round($self->{y_values}->[$i]);
            if ( $self->{x_values}->[$i] > $self->{max_x} ) {
                $self->{max_x}       = $self->{x_values}->[$i];
                $self->{max_x_index} = $i;
            }
            elsif ( $self->{x_values}->[$i] < $self->{min_x} ) {
                $self->{min_x}       = $self->{x_values}->[$i];
                $self->{min_x_index} = $i;
            }
            if ( $self->{y_values}->[$i] > $self->{max_y} ) {
                $self->{max_y}       = $self->{y_values}->[$i];
                $self->{max_y_index} = $i;
            }
            elsif ( $self->{y_values}->[$i] < $self->{min_y} ) {
                $self->{min_y}       = $self->{y_values}->[$i];
                $self->{min_y_index} = $i;
            }
        }
    }
    $self->{dirty} = 0;
}

sub move_to_origin {
    my $self = shift;
    $self->analyze;
    $self->move_by( -$self->{min_x}, -$self->{min_y} );
    map { $_->move_by( -$self->{min_x}, -$self->{min_y} ) }
      @{ $self->{child_paths} };
    $self->{max_x} -= $self->{min_x};
    $self->{max_y} -= $self->{min_y};
    $self->{min_x} = 0;
    $self->{min_y} = 0;
    return $self;
}

sub move_by {
    my ( $self, $dx, $dy ) = @_;
    for ( my $i = 0 ; $i < @{ $self->{x_values} } ; $i++ ) {
        $self->{x_values}->[$i] += $dx;
        $self->{y_values}->[$i] += $dy;
    }
}

sub flip {
    my $self = shift;
    for ( my $i = 0 ; $i < @{ $self->{x_values} } ; $i++ ) {
  #      $self->{x_values}->[$i] = 0 - $self->{x_values}->[$i];
        $self->{y_values}->[$i] = 0 - $self->{y_values}->[$i];
    }
    $self->{dirty} = 1;

}

sub _as_string {
    my $self = shift;
    my @points;
    for ( my $i = 0 ; $i < @{ $self->{x_values} } ; $i++ ) {
        push @points, "$self->{x_values}->[$i] $self->{y_values}->[$i]";
    }
    return ( join( ',', @points ) );
}

sub as_String {
    my $self = shift;

    return 'LINESTRING(' . $self->_as_string . ')';
}

sub as_SVG_path {
    my $self = shift;
    return 'M' . $self->_as_string;
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
