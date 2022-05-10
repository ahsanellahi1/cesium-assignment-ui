import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

import styles from './index.module.css';

const Button = ({ text, icon, onClick, className, disabled, type }) => {
  const containerClassName = clsx([
    styles.container,
    {
      [styles.primary]: type === Button.Type.Primary,
      [styles.danger]: type === Button.Type.Danger,
    },
    className,
    {
      [styles.disabled]: disabled,
    },
  ]);

  return (
    <div className={containerClassName} onClick={disabled ? () => {} : onClick}>
      {icon && <FontAwesomeIcon icon={icon} className={styles.icon} />}
      <p className={styles.text}>{text}</p>
    </div>
  );
};

Button.Type = { Primary: 'Primary', Danger: 'Danger' };

Button.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.object,
  onClick: PropTypes.func.isRequired,
  type: PropTypes.oneOf(Object.values(Button.Type)),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  type: Button.Type.Primary,
};

export default Button;
