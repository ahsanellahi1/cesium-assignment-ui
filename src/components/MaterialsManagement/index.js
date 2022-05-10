import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { faAdd, faTrash } from "@fortawesome/free-solid-svg-icons";

import styles from "./index.module.css";

import Button from "../Button";
import MaterialListItem from "../MaterialsListItem";
import { initialMaterialValues } from "../../constants/materials";
import * as MaterialsApi from "../../api/materials";

import { SketchPicker } from "react-color";
const { v4: uuidV4 } = require("uuid");

const MaterialsManagement = ({ className }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    MaterialsApi.getAll()
      .then((materials) => {
        setMaterials(materials);
        if (materials.length) setSelectedMaterialId(materials[0]?.id);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const findMaterialById = (materialId) => {
    if (!materialId) return;

    return materials.find(({ id }) => id === materialId);
  };

  const selectedMaterial = findMaterialById(selectedMaterialId);

  useEffect(() => {
    if (selectedMaterial) {
      document.getElementById("name").value = selectedMaterial?.name;
      document.getElementById("volume").value = getFormattedFloatStr(
        selectedMaterial?.volume
      );
      document.getElementById("cost").value = getFormattedFloatStr(
        selectedMaterial?.cost
      );
    }
  }, [selectedMaterial]);

  const getFormattedFloatStr = (float) => parseFloat(float).toFixed(2);

  const handleAdd = () => {
    const fakeId = uuidV4();
    setMaterials([
      ...materials,
      {
        ...initialMaterialValues,
        id: fakeId,
        deliveryDate: new Date().toLocaleDateString("en-GB"),
      },
    ]);
    setSelectedMaterialId(fakeId);

    MaterialsApi.add({
      ...initialMaterialValues,
      deliveryDate: new Date().toLocaleDateString("en-GB"),
    })
      .then((recievedMaterial) => {
        setError(null);
        setMaterials((state) => {
          return state.map((savedMaterial) => {
            if (savedMaterial?.id === fakeId) return recievedMaterial;

            return savedMaterial;
          });
        });

        setSelectedMaterialId(recievedMaterial.id);
      })
      .catch((error) => {
        console.error(error);
        setError(error.response.data.errors[0].msg);

        setMaterials((state) => {
          return state.filter((savedMaterial) => savedMaterial.id !== fakeId);
        });
      });
  };

  const handleDelete = () => {
    const materialCopy = { ...findMaterialById(selectedMaterialId) };
    const materialIndex = materials.findIndex(
      ({ id }) => id === selectedMaterialId
    );

    const nextElemIndex =
      materials.length === 1
        ? -1
        : materialIndex === materials.length - 1
        ? 0
        : materialIndex + 1;

    setSelectedMaterialId(materials[nextElemIndex]?.id);

    setMaterials((state) =>
      state.filter((savedMaterial) => savedMaterial.id !== selectedMaterialId)
    );

    MaterialsApi.remove(selectedMaterialId)
      .then(() => {
        setError(null);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to delete material!");

        setMaterials((state) => {
          const copiedState = [...state];
          copiedState.splice(materialIndex, 0, materialCopy);

          return copiedState;
        });
      });
  };

  const handleBlur = (event) => {
    let {
      target: { type, name, value },
    } = event;

    if (type === "date") {
      if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
        alert("Are you sure you want to select an old date?");
      }
      value = new Date(value).toLocaleDateString("en-GB");
    }

    const materialCopy = { ...selectedMaterial };

    setMaterials((state) =>
      state.map((savedMaterial) => {
        if (savedMaterial?.id === selectedMaterialId)
          return { ...savedMaterial, [name]: value };

        return savedMaterial;
      })
    );

    MaterialsApi.update({ ...materialCopy, [name]: value })
      .then(() => {
        setError(null);
      })
      .catch((error) => {
        console.error(error);
        setError(error.response.data.errors[0].msg);

        document.getElementById("name").value = materialCopy.name;
        document.getElementById("volume").value = getFormattedFloatStr(
          selectedMaterial?.volume
        );
        document.getElementById("cost").value = getFormattedFloatStr(
          selectedMaterial?.cost
        );

        setMaterials((state) =>
          state.map((savedMaterial) => {
            if (savedMaterial?.id === selectedMaterialId) return materialCopy;

            return savedMaterial;
          })
        );
      });
  };

  const handleMaterialSelect = ({ id }) => {
    setSelectedMaterialId(id);
  };

  const handleColorInputClick = () => {
    setColorPickerVisible(true);
  };

  const handleColorPickerCloseClick = () => {
    setColorPickerVisible(false);
  };

  const handleColorPick = ({ hex }) => {
    handleBlur({
      target: { type: "text", name: "color", value: hex },
    });
  };

  const renderTitle = () => <h1 className={styles.title}>Materials</h1>;

  const renderButtonGroup = () => (
    <div className={styles["button-group"]}>
      <Button icon={faAdd} text="Add" onClick={handleAdd} />
      <Button
        onClick={handleDelete}
        icon={faTrash}
        text="Delete"
        type={Button.Type.Danger}
        disabled={!selectedMaterialId}
      />
    </div>
  );

  const renderMaterialsSection = () => (
    <div className="row">
      {renderMaterialsList()}
      {renderForm()}
    </div>
  );

  const renderMaterialsList = () => (
    <div
      className={clsx(styles["materials-list"], {
        [styles["materials-list-empty"]]: !materials.length,
      })}
    >
      {materials.map((material) => (
        <MaterialListItem
          key={material.id}
          data={material}
          onClick={handleMaterialSelect}
          selected={selectedMaterialId === material.id}
        />
      ))}
      {!materials.length && <p>No Materials</p>}
    </div>
  );

  const renderForm = () => {
    return (
      <div className={styles.form}>
        {selectedMaterial && (
          <>
            <div className="row">
              <div className={clsx("col", styles["form-input-control"])}>
                <p>Name</p>
                <input
                  id="name"
                  type="text"
                  name="name"
                  defaultValue={selectedMaterial.name}
                  onBlur={handleBlur}
                  autoFocus
                />
              </div>
              <div className={clsx("col", styles["form-input-control"])}>
                <p>Color</p>
                <div
                  className={styles["form-color-input"]}
                  style={{ backgroundColor: selectedMaterial.color }}
                  onClick={handleColorInputClick}
                >
                  {/* styled */}
                </div>
                {colorPickerVisible && (
                  <div className={styles["color-picker-container"]}>
                    <div className={styles["color-picker-cover"]}>
                      <div
                        className={styles["close"]}
                        onClick={handleColorPickerCloseClick}
                      >
                        &#x2715;
                      </div>
                      <SketchPicker
                        color={selectedMaterial.color}
                        type="text"
                        name="color"
                        onChange={handleColorPick}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="row">
              <div className={clsx("col", styles["form-input-control"])}>
                <p>Volume (m&sup3;)</p>
                <input
                  id="volume"
                  type="number"
                  name="volume"
                  min={0}
                  step={0.01}
                  defaultValue={getFormattedFloatStr(selectedMaterial.volume)}
                  onBlur={handleBlur}
                />
              </div>
              <div className={clsx("col", styles["form-input-control"])}>
                <p>Cost (USD per m&sup3;)</p>
                <input
                  id="cost"
                  type="number"
                  name="cost"
                  defaultValue={getFormattedFloatStr(selectedMaterial.cost)}
                  min={0}
                  step={0.01}
                  onBlur={handleBlur}
                />
              </div>
            </div>
            <div className="row">
              <div className={clsx("col", styles["form-input-control"])}>
                <p>Delivery Date</p>
                <input
                  type="date"
                  name="deliveryDate"
                  value={new Date(
                    selectedMaterial?.deliveryDate
                      ?.split("/")
                      ?.reverse()
                      ?.join("-")
                  ).toLocaleDateString("sv-SE")}
                  onChange={handleBlur}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const getCost = () => {
    const sum = materials.reduce((prev, cur) => {
      return prev + parseFloat(cur.cost);
    }, 0.0);

    return getFormattedFloatStr(sum);
  };

  const renderTotal = () => (
    <div className={clsx("row", styles["cost-container"])}>
      <p>Total Cost:</p>
      <p>${getCost()}</p>
    </div>
  );

  const renderError = () => {
    return (
      <div>
        <p className="error">{error}&nbsp;</p>
      </div>
    );
  };

  return (
    <div className={clsx([styles.container, className])}>
      {renderTitle()}
      {renderButtonGroup()}
      {renderMaterialsSection()}
      {renderTotal()}
      {renderError()}
    </div>
  );
};

MaterialsManagement.propTypes = {
  className: PropTypes.string,
};

MaterialsManagement.defaultProps = {
  className: "",
};

export default MaterialsManagement;
