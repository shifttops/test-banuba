import { FC } from 'react';
// @ts-ignore
import styles from './loader.module.scss';

const Loader: FC = () => (
  <svg className={styles.loader} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <g
      fill="none"
      fillRule="evenodd"
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      transform="translate(1 1)"
    >
      <path
        d="M10 0v4M10 16v4M2.93 2.93l2.83 2.83M14.24 14.24l2.83 2.83M0 10h4M16 10h4M2.93 17.07l2.83-2.83M14.24 5.76l2.83-2.83"
      />
    </g>
  </svg>
);

export default Loader;
