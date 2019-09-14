import React from "react";

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

  static fromEvent(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    return new Vector(e.clientX, e.clientY);
  }

  subtract(w: Vector) {
    return new Vector(this.x - w.x, this.y - w.y);
  }

  add(w: Vector) {
    return new Vector(this.x + w.x, this.y + w.y);
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
  const [startVector, updateStartVector] = React.useState<Vector>(
    new Vector(0, 0)
  );

  const addItem = React.useCallback(() => {
    const item: Item = {
      shape: Shape.Circle,
      id: idCount,
      height: 20,
      width: 20,
      v: new Vector(0, 0)
    };
    updateItems({ ...items, [idCount]: item });
    updateIdCount(idCount + 1);
  }, [items, idCount]);

  const moveItem = React.useCallback(
    (v: Vector, id: number) => {
      const target = items[id];
      const nextV = target.v.add(v);
      const newItem = { ...target, v: nextV };
      updateItems({ ...items, [id]: newItem });
    },
    [items]
  );

  const catchShape = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, id: number) => {
      updateTargetId(id);
    },
    []
  );

  const catchShapeOnScreen = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      updateStartVector(Vector.fromEvent(e));
    },
    []
  );

  const releaseShape = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!targetId) {
        return;
      }
      const endVector = Vector.fromEvent(e);
      const moveVector = endVector.subtract(startVector);
      moveItem(moveVector, targetId);
      updateTargetId(0);
    },
    [startVector, targetId, moveItem]
  );

  return (
    <div>
      <div
        style={{ position: "relative", width: 400, height: 400 }}
        onMouseUp={e => releaseShape(e)}
        onMouseDown={catchShapeOnScreen}
      >
        {Object.keys(items).map(id => {
          const item = items[id];
          return (
            <div
              key={id}
              style={{ position: "absolute", top: item.v.y, left: item.v.x }}
              onMouseDown={e => catchShape(e, parseInt(id))}
            >
              a
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
