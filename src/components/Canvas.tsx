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
}

type Item = {
  readonly id: number;
  readonly shape: Shape;
  readonly v: Vector;
  readonly height: number;
  readonly width: number;
};

export const Canvas: React.SFC<{}> = () => {
  const [items, updateItems] = React.useState<{ [key: string]: Item }>({});
  const [idCount, updateIdCount] = React.useState<number>(1);
  const [moveTargetId, updateMoveTargetId] = React.useState<number>(0);
  const [selectedId, updateSelectedId] = React.useState<number>(0);
  const [isExpanding, updateIsExpanding] = React.useState<boolean>(false);
  const [
    previousExpansionPosition,
    updatePreviousExpansionPosition
  ] = React.useState<Vector>(Vector.ORIGIN);
  const [negateVector, updateNegateVector] = React.useState<Vector>(
    Vector.ORIGIN
  );

  const addItem = React.useCallback(() => {
    const item: Item = {
      shape: Shape.Circle,
      id: idCount,
      height: 20,
      width: 20,
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
    (v: Vector, id: number) => {
      const target = items[id];
      const newItem = {
        ...target,
        height: target.height + v.y,
        width: target.width + v.x
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
    [isExpanding]
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
        const diff = currentPosition.subtract(previousExpansionPosition);
        resizeItem(diff, selectedId);
        updatePreviousExpansionPosition(currentPosition);
      }
    },
    [
      negateVector,
      moveTargetId,
      moveItem,
      isExpanding,
      previousExpansionPosition,
      selectedId,
      resizeItem
    ]
  );

  const releaseOnScreen = React.useCallback(() => {
    updateNegateVector(Vector.ORIGIN);
    updateMoveTargetId(0);
    updateIsExpanding(false);
    updatePreviousExpansionPosition(Vector.ORIGIN);
  }, []);

  const clickExpand = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>, id: number) => {
      updateIsExpanding(true);
      updateSelectedId(id);
      updatePreviousExpansionPosition(Vector.fromEventClient(e));
      e.stopPropagation();
    },
    []
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
                backgroundColor:
                  selectedId === idNumber ? "lightsalmon" : "unset"
              }}
              key={id}
            >
              <div
                style={{
                  position: "relative"
                }}
              >
                <Turtle
                  style={{
                    height: item.height,
                    width: item.width
                  }}
                  onMouseDown={e => catchShape(e, idNumber)}
                />
                <div
                  style={{
                    position: "absolute",
                    left: item.width + 1,
                    top: item.height + 1
                  }}
                  onMouseDown={e => clickExpand(e, idNumber)}
                >
                  x
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
