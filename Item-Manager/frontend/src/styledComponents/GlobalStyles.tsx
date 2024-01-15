import { createGlobalStyle } from 'styled-components';
import { normalize } from './normalize-css';

export const GlobalStyles = createGlobalStyle`
/* NORMALIZE */

  ${normalize}

/* GLOBAL STYLES */
:root {
  --ff-sans: 'Poppins', sans-serif;

  --fw-light:200;
  --fw-normal:400;
  --fw-bold:600;

  --fs-400:0.9375rem;
  --fs-500:1.25rem;
  --fs-900:2.5rem;

  --clr-neutral-900:hsl(234,12%, 34%);
  --clr-neutral-400: hsl(229, 6%, 66%);
  --clr-neutral-100: hsl(0,0%, 89%);

  --clr-yellow-800: hsl(34, 89%, 65%);
  --clr-yellow-500: hsl(53, 88%, 64%);
  --clr-yellow-300: hsl(65, 88%, 63%);

}

*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--ff-sans);
  font-weight: var(--fw-normal);
  line-height: 1.7;
  color: var(--clr-neutral-400);
}

h1,h2,h3 {
  line-height: 1.1;
  color: var(--clr-neutral-900);
}
img {
  width: 20px;
}`;
