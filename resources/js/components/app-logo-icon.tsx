import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 2.5 5 13h5.5L9.8 21.5 19 10.5h-5.7l.2-8Z" fill="currentColor" />
        </svg>
    );
}
