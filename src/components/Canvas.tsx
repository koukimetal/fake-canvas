import { useState, useCallback } from "react";

enum Shape {
    Circle,
}

type Item = {
    readonly id: number;
    readonly shape: Shape;
    readonly x: number;
    readonly y: number;
    readonly height: number;
    readonly width: number;
};

export const Canvas: React.SFC<{}> = () => {
    const [items, updateItems] = useState<{[key: string]: Item}>({});
    const [idCount, updateIdCount] = useState<number>(1);
    const [targetId, updateTargetId] = useState<number>(0);

    const addItem = useCallback((item: Item) => {
        updateItems({...items, [idCount]: item});
        updateIdCount(idCount + 1);
    }, [idCount]);

    const moveItem = useCallback((x: number, y: number) => {
        const target = items[targetId];
        const newItem = {...target, x, y};
        updateItems({...items, [targetId]: newItem});
    }, [targetId]);

    const catchShape = useCallback((id: number) => {
        updateTargetId(id);
    }, []);

    return (
    <div>
    <div style={{position: "relative", width: 400, height: 400}}>
        {Object.keys(items).map(id => {
            const item = items[id];
            return (
                <div style={{position: "absolute", top: item.y, left: item.x}}
                onClick={() => catchShape(parseInt(id))}
                
                >a</div>
            )
        })}
        </div>
    </div>);

}