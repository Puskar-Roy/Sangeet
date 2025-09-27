import React from 'react'
import Svg , { Path } from 'react-native-svg';


export default function Home() {
  return (
    <Svg
      width="22"
      height="24"
      viewBox="0 0 22 24"
      fill="none"
      
    >
      <Path
        d="M3.20001 9L11.24 2L19.28 9V20C19.28 20.5304 19.0918 21.0391 18.7567 21.4142C18.4216 21.7893 17.9672 22 17.4933 22H4.98668C4.51283 22 4.05838 21.7893 3.72331 21.4142C3.38825 21.0391 3.20001 20.5304 3.20001 20V9Z"
        stroke="#8E8E8E"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M8.56 22V12H13.92V22"
        stroke="#8E8E8E"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
}