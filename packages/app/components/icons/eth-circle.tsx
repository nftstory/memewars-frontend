import * as React from "react";
import Svg, { SvgProps, Circle, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
	<Svg width={24} height={24} fill="none" {...props}>
		<Circle cx={10.5} cy={10.5} r={9.5} stroke="currentColor" strokeWidth={2} />
		<Path
			fill="currentColor"
			d="M6.63 10.676 10.5 3.62l3.869 7.055-3.87 2.162-3.868-2.162Z"
		/>
		<Path
			fill="currentColor"
			d="m10.5 17.048-3.983-5.803 3.983 2.39 3.983-2.39-3.983 5.803Z"
		/>
	</Svg>
);

export default SvgComponent;
