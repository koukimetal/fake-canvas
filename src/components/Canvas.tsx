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
  const [targetId, updateTargetId] = React.useState<number>(0);
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

  const catchShape = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>, id: number) => {
      updateTargetId(id);
      const vec = Vector.fromNativeEventOffset(e);
      updateNegateVector(vec.minus());
    },
    []
  );

  const moveOnScreen = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      if (!targetId) {
        return;
      }
      const currentPlace = Vector.fromEventClient(e);
      const newPlace = currentPlace.add(negateVector);
      moveItem(newPlace, targetId);
    },
    [negateVector, targetId, moveItem]
  );

  const releaseOnScreen = React.useCallback(() => {
    updateNegateVector(Vector.ORIGIN);
    updateTargetId(0);
  }, []);

  return (
    <div>
      <div
        style={{ position: "relative", width: 400, height: 400 }}
        onMouseUp={releaseOnScreen}
        onMouseMove={moveOnScreen}
      >
        {Object.keys(items).map(id => {
          const item = items[id];
          return (
            <Turtle
              key={id}
              style={{
                position: "absolute",
                top: item.v.y,
                left: item.v.x,
                height: item.height,
                width: item.width
              }}
              onMouseDown={e => catchShape(e, parseInt(id))}
            ></Turtle>
          );
        })}
      </div>
      <div>
        <button onClick={addItem}>Add</button>
      </div>
    </div>
  );
};
