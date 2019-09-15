import React from "react";
import { ReactComponent as Turtle } from "./turtle.svg";
enum Shape {
  Circle
}

class Vector {
  readonly x: number;
  readonly y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static readonly ORIGIN = new Vector(0, 0);

  static fromEventClient(e: React.MouseEvent<Element, MouseEvent>) {
    return new Vector(e.clientX, e.clientY);
  }

  static fromNativeEventOffset(e: React.MouseEvent<Element, MouseEvent>) {
    return new Vector(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  }

  subtract(w: Vector) {
    return new Vector(this.x - w.x, this.y - w.y);
  }

  add(w: Vector) {
    return new Vector(this.x + w.x, this.y + w.y);
  }

  minus() {
    return new Vector(-this.x, -this.y);
  }

  dis() {
    return Math.hypot(this.x, this.y);
  }
}

type Item = {
  readonly id: number;
  readonly shape: Shape;
  readonly v: Vector;
  readonly height: number;
  readonly width: number;
  readonly degree: number;
};

const getDegree = (n: Vector) => {
  const x = n.x;
  const r = n.dis();
  let theta1 = Math.acos(x / r) * (n.y >= 0 ? 1 : -1);
  theta1 = theta1 < 0 ? theta1 + Math.PI * 2 : theta1;
  const d = (180 * theta1) / Math.PI;
  return d;
};

const calculateRotation = (o: Vector, p: Vector) => {
  const n = p.subtract(o);
  const d = getDegree(n);
  return d;
};

/*
  h (cos(t + 90), sin(t + 90)) +
  w (cost(t), sint(t)) =
  (x, y)
  h = ycos(t) - xsin(t), w = ysin(t) + xcos(t)
*/
const calculateExpansion = (o: Vector, p: Vector, d: number) => {
  const n = p.subtract(o);
  const dpi = (d / 360) * (2 * Math.PI);
  const h = n.y * Math.cos(dpi) - n.x * Math.sin(dpi);
  const w = n.y * Math.sin(dpi) + n.x * Math.cos(dpi);
  return new Vector(w, h);
};

export const Canvas: React.SFC<{}> = () => {
  const [items, updateItems] = React.useState<{ [key: string]: Item }>({});
  const [idCount, updateIdCount] = React.useState<number>(1);
  const [moveTargetId, updateMoveTargetId] = React.useState<number>(0);
  const [selectedId, updateSelectedId] = React.useState<number>(0);
  const [isExpanding, updateIsExpanding] = React.useState<boolean>(false);
  const [
    beforeExpandedSizeVector,
    updateBeforeExpandedSizeVector
  ] = React.useState<Vector>(Vector.ORIGIN);
  const [expansionStartPosition, updateExpansionStartPosition] = React.useState<
    Vector
  >(Vector.ORIGIN);
  const [negateVector, updateNegateVector] = React.useState<Vector>(
    Vector.ORIGIN
  );
  const [isRotating, updateIsRotating] = React.useState<boolean>(false);
  const [
    rotationStartPointDegree,
    updateRotationStartPointDegree
  ] = React.useState<number>(0);
  const [
    rotationOriginalItemDegree,
    updateRotationOriginalItemDegree
  ] = React.useState<number>(0);
  const addItem = React.useCallback(() => {
    const item: Item = {
      shape: Shape.Circle,
      id: idCount,
      height: 20,
      width: 20,
      degree: 0,
      v: Vector.ORIGIN
    };
    updateItems({ ...items, [idCount]: item });
    updateIdCount(idCount + 1);
  }, [items, idCount]);

  const moveItem = React.useCallback(
    (v: Vector, id: number) => {
      const target = items[id];
      const newItem = { ...target, v };
      updateItems({ ...items, [id]: newItem });
    },
    [items]
  );

  const resizeItem = React.useCallback(
    (height: number, width: number, id: number) => {
      const target = items[id];
      const newItem = {
        ...target,
        height,
        width
      };
      updateItems({ ...items, [id]: newItem });
    },
    [items]
  );

  const rotateItem = React.useCallback(
    (degree: number, id: number) => {
      const target = items[id];
      const newItem = {
        ...target,
        degree
      };
      updateItems({ ...items, [id]: newItem });
    },
    [items]
  );

  const catchShape = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>, id: number) => {
      updateMoveTargetId(id);
      updateSelectedId(id);
      const vec = Vector.fromNativeEventOffset(e);
      updateNegateVector(vec.minus());
      // stop propagation to avoid setting 0 as a selected id
      e.stopPropagation();
    },
    []
  );

  const clickOnScreen = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      updateSelectedId(0);
    },
    []
  );

  const moveOnScreen = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      if (moveTargetId) {
        const currentPlace = Vector.fromEventClient(e);
        const newPlace = currentPlace.add(negateVector);
        moveItem(newPlace, moveTargetId);
      }
      if (isExpanding && selectedId) {
        const currentPosition = Vector.fromEventClient(e);
        const diff = calculateExpansion(
          expansionStartPosition,
          currentPosition,
          items[selectedId].degree
        );
        const resized = beforeExpandedSizeVector.add(diff);
        resizeItem(resized.y, resized.x, selectedId);
      }
      if (isRotating && selectedId) {
        const item = items[selectedId];
        const origin = new Vector(
          item.v.x + item.width / 2,
          item.v.y + item.height / 2
        );
        const currentPosition = Vector.fromEventClient(e);

        const degreeDiff =
          calculateRotation(origin, currentPosition) - rotationStartPointDegree;
        const degree = rotationOriginalItemDegree + degreeDiff;
        rotateItem(degree, selectedId);
      }
    },
    [
      items,
      negateVector,
      moveTargetId,
      moveItem,
      beforeExpandedSizeVector,
      isExpanding,
      expansionStartPosition,
      isRotating,
      rotationStartPointDegree,
      rotationOriginalItemDegree,
      rotateItem,
      selectedId,
      resizeItem
    ]
  );

  const releaseOnScreen = React.useCallback(() => {
    updateNegateVector(Vector.ORIGIN);
    updateMoveTargetId(0);
    updateIsExpanding(false);
    updateExpansionStartPosition(Vector.ORIGIN);
    updateBeforeExpandedSizeVector(Vector.ORIGIN);
    updateIsRotating(false);
    updateRotationStartPointDegree(0);
  }, []);

  const clickExpand = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>, id: number) => {
      updateIsExpanding(true);
      updateSelectedId(id);
      updateExpansionStartPosition(Vector.fromEventClient(e));
      updateBeforeExpandedSizeVector(
        new Vector(items[id].width, items[id].height)
      );
      e.stopPropagation();
    },
    [items]
  );

  const clickRotate = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>, id: number) => {
      updateIsRotating(true);
      updateSelectedId(id);
      const item = items[id];
      const origin = new Vector(
        item.v.x + item.width / 2,
        item.v.y + item.height / 2
      );
      const rPoint = Vector.fromEventClient(e);
      const degree = getDegree(rPoint.subtract(origin));
      updateRotationOriginalItemDegree(item.degree);
      updateRotationStartPointDegree(degree);
      e.stopPropagation();
    },
    [items]
  );

  return (
    <div>
      <div
        style={{
          position: "relative",
          width: 400,
          height: 400,
          backgroundColor: "aliceblue"
        }}
        onMouseUp={releaseOnScreen}
        onMouseMove={moveOnScreen}
        onMouseDown={clickOnScreen}
      >
        {Object.keys(items).map(id => {
          const item = items[id];
          const idNumber = parseInt(id);
          return (
            <div
              style={{
                position: "absolute",
                top: item.v.y,
                left: item.v.x,
                transform: `rotate(${item.degree}deg)`,
                backgroundColor:
                  selectedId === idNumber ? "lightsalmon" : "unset"
              }}
              key={id}
            >
              <div
                style={{
                  position: "relative",
                  height: item.height,
                  width: item.width
                }}
              >
                <Turtle
                  style={{
                    height: "inherit",
                    width: "inherit"
                  }}
                  onMouseDown={e => catchShape(e, idNumber)}
                />
                <div
                  style={{
                    position: "absolute",
                    left: item.width + 1,
                    top: item.height + 1,
                    userSelect: "none"
                  }}
                  onMouseDown={e => clickExpand(e, idNumber)}
                >
                  x
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: item.height + 1,
                    userSelect: "none"
                  }}
                  onMouseDown={e => clickRotate(e, idNumber)}
                >
                  r
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <button onClick={addItem}>Add</button>
      </div>
    </div>
  );
};
