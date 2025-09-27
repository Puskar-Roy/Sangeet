import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type LoaderProps = {
  size?: number; // overall width (default 200)
  color?: string; // dot color (default #6156E2)
  duration?: number; // animation duration in ms (default 2000)
};

export const Loader: React.FC<LoaderProps> = ({
  size = 200,
  color = '#6156E2',
  duration = 2000,
}) => {
  const radius = size * 0.075; 
  const spacing = size / 3;
  const cy = size / 2;

  
  const anim1 = useRef(new Animated.Value(1)).current;
  const anim2 = useRef(new Animated.Value(1)).current;
  const anim3 = useRef(new Animated.Value(1)).current;

  const loopOpacity = React.useCallback((animatedValue: Animated.Value, delay: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: duration / 2,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [duration]);

  useEffect(() => {
    loopOpacity(anim1, 0);
    loopOpacity(anim2, duration / 4);
    loopOpacity(anim3, duration / 2);
  }, [anim1, anim2, anim3, duration, loopOpacity]);

  return (
    <Svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
      <AnimatedCircle
        fill={color}
        r={radius}
        cx={spacing * 0.6}
        cy={cy / 1}
        opacity={anim1}
      />
      <AnimatedCircle
        fill={color}
        r={radius}
        cx={spacing * 1.8}
        cy={cy / 1}
        opacity={anim2}
      />
      <AnimatedCircle
        fill={color}
        r={radius}
        cx={spacing * 3 - spacing * 0.6}
        cy={cy / 1}
        opacity={anim3}
      />
    </Svg>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
