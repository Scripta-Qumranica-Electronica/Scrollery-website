package SQE_GEO::svg_path;
use strict;
use warnings FATAL => 'all';
use SQE_GEO::polygon;
use SQE_GEO::multipolygon;

sub new {
    my $class = shift;
    my $self  = bless {
        svg_source_path => shift,
            units_em => shift,
        lastX           => 0,
        lastY           => 0,
        lastControlX    => 0,
        lastControlY    => 0,
        startX          => 0,
        startY          => 0,
        polygons        => [],
    }, $class;
    $self->{single_step} = $self->{units_em}/40;
    $self->{single_step} = 1 if $self->{single_step}<1;
    $self->calculate_points;
    return $self;
}

# Returns the path points as a value for the d-Attribute of an SVG-Path
sub svg_path {
    my $self = shift;
    my $out  = '';
    return join( '', map { $_->as_SVG_path } @{ $self->{polygons} } );
}

#@method
#@returns SQE_GEO::multipolygon
sub GIS_multipolygon {
    my $self = shift;

    # Holds the final polygons
    my @polygons = ();

    # Run on each set of points  = path
    foreach my $polygon ( @{ $self->{polygons} } ) {

        my $add = 1;
        for ( my $i = 0 ; $i < @polygons ; $i++ ) {
            my $known_polygon = $polygons[$i];

# If the polygon can't be determined as a child, grand-child ... of the known polygon
            if ( $known_polygon->accept_as_child($polygon) == 0 ) {

                # Test, whether the new one contains the known one
                if ( $polygon->contains($known_polygon) ) {

                    # If true, add the h´nown one as child to the new one
                    $known_polygon->set_as_child_of($polygon);

                    # and put the new one at the position of the known one
                    $polygons[$i] = $polygon;
                    $add = 0;

                    #and stop
                    last;
                }
            }
            else {
                # The polygon is already set as a child
                $add = 0;
                last;
            }
        }
        push @polygons, $polygon if $add;
    }
    my @flatten_polygons = ();
    foreach my $polygon (@polygons) {
        push @flatten_polygons, $polygon->flatten;
    }
    return SQE_GEO::multipolygon->new(@flatten_polygons);
}

sub _add_points {
    my $self = shift;
    $self->{polygons}->[-1]->add_points(@_);
    ( $self->{lastControlX}, $self->{lastControlY} ) =
      $self->{polygons}->[-1]->get_point(-1);

}

sub calculate_points {
    my $self            = shift;
    my $svg_source_path = $self->{svg_source_path};
    $svg_source_path =~ s/[\n\r]/ /gmo;
    $svg_source_path =~ s/ *([MmLlHhVvAaQqTtCcSsZz]) */:$1:/go;
    $svg_source_path =~ s/[-] */ -/go;
    $svg_source_path =~ s/ +/ /go;
    my @path_elements = split( /:/, $svg_source_path );

    for ( my $i = 1 ; $i < @path_elements ; $i++ ) {
        my $element = $path_elements[ $i++ ];
        if ( uc($element) ne 'Z' ) {
            my $data = [ split( / /, $path_elements[$i] ) ];
            shift @$data while ( defined $data->[0] ) && $data->[0] eq '';
            if ( $element eq 'M' || $element eq 'L' ) {
                $self->_set_last_point_from_data($data);
                if ( $element eq 'M' ) {
                    push $self->{polygons}, SQE_GEO::polygon->new;
                    $self->{startX} = $self->{lastX};
                    $self->{startY} = $self->{lastY};
                }
                $self->_add_points(@$data);
            }
            elsif ( $element eq 'm' || $element eq 'l' ) {
                $self->_move_points($data);
                if ( $element eq 'm' ) {
                    push $self->{polygons}, SQE_GEO::polygon->new;
                    $self->{startX} = $self->{lastX};
                    $self->{startY} = $self->{lastY};
                }
                $self->_add_points(@$data);
            }
            elsif ( $element eq 'H' ) {
                $self->{lastX} = $data->[0];
                $self->_add_points( $self->{lastX}, $self->{lastY} );
            }
            elsif ( $element eq 'h' ) {
                $self->{lastX} += $data->[0];
                $self->_add_points( $self->{lastX}, $self->{lastY} );
            }
            elsif ( $element eq 'V' ) {
                $self->{lastY} = $data->[0];
                $self->_add_points( $self->{lastX}, $self->{lastY} );
            }
            elsif ( $element eq 'v' ) {
                $self->{lastY} += $data->[0];
                $self->_add_points( $self->{lastX}, $self->{lastY} );
            }

#           elsif (uc($element) eq 'Q') {
#               my ($startX, $startY, @data) = $self->_prepare_data($element, $data);
#               my $i = 0;
#               $self->{svg_path} .= 'L';
#               while ($i < @data) {
#                   $self->{svg_path} .= $self->_calculate_quad_bezier_points($startX, $startY, @data[$i .. $i + 3]);
#                   $startX = $data[$i + 2];
#                   $startY = $data[$i + 3];
#                   $i += 4;
#               }
#               chomp $self->{svg_path};
#           }
            elsif ( uc($element) eq 'C' ) {
                if ( $element ne 'C' ) {
                    $self->_move_points_for_bezier( $data, 1 );
                }

                $self->_run_cube_bezier( $element, $data );

            }

            elsif ( uc($element) eq 'S' ) {
                my ( $x, $y ) = $self->_reflect_last_control;
                unshift @$data, ( 0, 0 );
                if ( $element eq 's' ) {
                    $self->_move_points_for_bezier( $data, 1 );
                }
                $data->[0] = $x;
                $data->[1] = $y;
                $self->_run_cube_bezier( 'C', $data );

            }
            else {
                print "$element\n";
            }
        }
        else {
            $self->{polygons}->[-1]->close_path;
        }
    }
}

sub _run_cube_bezier {
    my ( $self, $element, $data ) = @_;
    my ( $startX, $startY ) = ( $self->{lastX}, $self->{lastY} );
    $self->_set_last_point_from_data($data);
    my $i = 0;
    while ( $i < @$data ) {
        $self->_add_points(
            $self->_calculate_cube_bezier_points(
                $startX, $startY, @$data[ $i .. ( $i + 5 ) ]
            )
        );
        $startX = $data->[ $i + 4 ];
        $startY = $data->[ $i + 5 ];
        $i += 6;
    }
    $self->{lastControlX} = $data->[-4];
    $self->{lastControlY} = $data->[-3];


}

sub _calculate_coord_quad_bezier {
    my ( $start, $control, $end, $step ) = @_;
    return ( ( 1 - $step )**2 ) * $start +
      2 * $step * ( 1 - $step ) * $control +
      ( $step**2 ) * $end;
}

sub _calculate_quad_bezier_points {
    my ( $self, $startX, $startY, $controlX, $controlY, $endX, $endY ) = @_;

    my $dertour_distance =
      sqrt( ( $controlX - $startX )**2 + ( $controlY - $startY )**2 ) +
      sqrt( ( $endX - $controlX )**2 +   ( $endY - $controlY )**2 ) -
      sqrt( ( $startX - $endX )**2 +     ( $startY - $endY )**2 );
    if ( $dertour_distance < 2 ) {
        return "$controlX $controlY $endX $endY";
    }
    else {
        my $step     = 1 / $dertour_distance / 2;
        my $distance = $step;
        my $out      = '';
        while ( $distance < 1 ) {
            $out .=
              _calculate_coord_quad_bezier( $startX, $controlX, $endX,
                $distance )
              . ' ';
            $out .=
              _calculate_coord_quad_bezier( $startY, $controlY, $endY,
                $distance )
              . ' ';
            $distance += $step;
        }
        return $out;
    }
}

sub _calculate_coord_cube_bezier {
    my ( $start, $control_1, $control_2, $end, $step ) = @_;
    return ( ( 1 - $step )**3 ) * $start +
      3 * $step * ( ( 1 - $step )**2 ) * $control_1 +
      3 * ( 1 - $step ) * ( $step**2 ) * $control_2 +
      ( $step**3 ) * $end;
}

sub _reflect_last_control {
    my $self = shift;
    return (
        2 * $self->{lastX} - $self->{lastControlX},
        2 * $self->{lastY} - $self->{lastControlY}
    );
}

sub _calculate_cube_bezier_points {
    my (
        $self,       $startX,     $startY, $controlX_1, $controlY_1,
        $controlX_2, $controlY_2, $endX,   $endY
    ) = @_;

    $self->{lastControlX} = $controlX_2;
    $self->{lastControlY} = $controlY_2;
    my $dertour_distance =
      sqrt( ( $controlX_1 - $startX )**2 + ( $controlY_1 - $startY )**2 ) +
      sqrt(
        ( $controlX_2 - $controlX_1 )**2 + ( $controlY_2 - $controlY_1 )**2 ) +
      sqrt( ( $endX - $controlX_2 )**2 + ( $endY - $controlY_2 )**2 );
    my $normal_distance =
      sqrt( ( $startX - $endX )**2 + ( $startY - $endY )**2 );
    my $d =$dertour_distance - $normal_distance;
    my $step = $d !=0 ? 1 / ( $dertour_distance - $normal_distance ) / 0.4 : 1;

    if ( $step > 1 ) {
        $step = 50 / $dertour_distance;
    }
    my $distance = $step;
    my @points   = ();
    my ($lastX, $lastY) = (undef, undef);

    while ( $distance < 1 ) {
        my $x =
          _calculate_coord_cube_bezier( $startX, $controlX_1, $controlX_2,
            $endX, $distance );
        my $y =
          _calculate_coord_cube_bezier( $startY, $controlY_1, $controlY_2,
            $endY, $distance );
        if ((defined $lastX) and (sqrt( ( $lastX - $x )**2 + ( $lastY - $y )**2 ) > $self->{single_step})) {
            push @points, ( $x, $y );
            ($lastX, $lastY) = ( $x, $y );

        } elsif (!(defined $lastX)) {
            ($lastX, $lastY) = ( $x, $y );

        }
        $distance += $step;

    }
    push @points, ( $endX, $endY );
    return @points;

}

sub _set_last_point_from_data {
    my ( $self, $data ) = @_;
    my $last = $#$data;
    $self->{lastX} = $data->[ $last - 1 ];
    $self->{lastY} = $data->[$last];
}

sub _move_points_for_bezier {
    my ( $self, $data, $is_cube ) = @_;
    my ( $startX, $startY ) = ( $self->{lastX}, $self->{lastY} );
    my $i = 0;
    while ( $i < @$data ) {
        $data->[ $i++ ] += $startX;
        $data->[ $i++ ] += $startY;
        if ($is_cube) {
            $data->[ $i++ ] += $startX;
            $data->[ $i++ ] += $startY;
        }
        $data->[ $i++ ] += $startX;
        $data->[ $i++ ] += $startY;
    }
}

sub _move_points {
    my ( $self, $data ) = @_;
    for ( my $i = 0 ; $i < @$data ; $i++ ) {
        $data->[$i] += $self->{lastX};
        $self->{lastX} = $data->[ $i++ ];
        $data->[$i] += $self->{lastY};
        $self->{lastY} = $data->[$i];
    }
}

sub _add_values {
    my ( $self, $data ) = @_;
    my $value = 0;
    map { $value += $_ } @$data;
    return $value;
}

sub width {
    my $self = $_;
    $self->{ma}
}

1;
