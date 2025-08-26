import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            {...props} 
            src="/img/syu bussiness co.png" 
            alt="SYU Business Co Logo"
            className={`${props.className} object-contain`}
        />
    );
}
