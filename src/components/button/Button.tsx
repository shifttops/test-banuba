import { FC, MouseEvent } from 'react';
import cn from 'classnames';
// @ts-ignore
import styles from './button.module.scss';

interface ButtonI {
  Icon?: FC;
  text?: string;
  isEnabled: boolean;
  handleClick(event: MouseEvent<HTMLButtonElement>): void;
}

const Button: FC<ButtonI> = ({
  handleClick, Icon, text, isEnabled,
}) => (
  <button
    className={cn(styles.button, { [styles.inactive]: !isEnabled })}
    type="button"
    onClick={handleClick}
  >
    {Icon ? <Icon /> : null}
    {text}
  </button>
);

Button.defaultProps = {
  Icon: () => <span />,
  text: '',
};

export default Button;
