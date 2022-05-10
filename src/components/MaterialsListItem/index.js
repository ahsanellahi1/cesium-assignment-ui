import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { numberWithCommas } from "../../helpers";
import styles from "./index.module.css";

const MaterialListItem = ({ data, onClick, selected }) => {
  return (
    <div
      className={clsx(styles.container, { [styles.selected]: selected })}
      onClick={onClick.bind(null, data)}
    >
      <div className={styles.color} style={{ backgroundColor: data.color }}>
        {/* styled */}
      </div>
      <div className="column" style={{ marginLeft: "10px" }}>
        <p className={styles["text-primary"]}>{data.name}</p>
        <p className={styles["text-secondary"]}>
          {numberWithCommas(data.volume)} m&sup3;
        </p>
      </div>
    </div>
  );
};

MaterialListItem.propTypes = {
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default MaterialListItem;
