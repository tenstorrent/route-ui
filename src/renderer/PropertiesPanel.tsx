import {useContext, useEffect, useState} from 'react';
import DataSource from '../data/DataSource';
import {Pipe} from '../data/DataStructures';

export default function PropertiesPanel() {
    const { svgData, setSvgData } = useContext(DataSource);
    const [html, setHtml] = useState(null);

    useEffect(() => {
        const pipes: Map<string, Pipe[]> = new Map();
        svgData.nodes.forEach((n) => {
            n.links.forEach((l) => {
                l.pipes.forEach((p) => {
                    if (!pipes.has(p.id)) {
                        pipes.set(p.id, []);
                    }
                    pipes.get(p.id).push(p);
                });
            });
        });

        const out: JSX.Element[] = [];
        pipes.forEach((pipe: Pipe[], key: string) => {
            out.push(
                <p
                    key={key}
                    // className={pipe[0].selected ? 'selected' : ''}
                >
                    <input
                        type="checkbox"
                        checked={pipe[0].selected}
                        onChange={(e) => {
                            // console.log(pipe)
                            selectLinks(key, e.target.checked);
                        }}
                    />
                    {key}
                </p>
            );

            // console.log(key, pipe);
        });

        setHtml(out);

        const selectLinks = (pipeId: string, val: boolean = false) => {
            svgData.nodes.forEach((n) => {
                n.links.forEach((l) => {
                    l.pipes.forEach((p) => {
                        if (p.id === pipeId) {
                            l.selected = val;
                            p.selected = val;
                        } else {
                            // l.selected = false;
                        }
                    });
                });
            });
            setSvgData({...svgData});
        };


        // selectLinks('100115900000', true)
    }, [svgData]);

    const clearAll = () => {
        svgData.nodes.forEach((n) => {
            n.links.forEach((l) => {
                l.selected = false;
            });
        });
        setSvgData({...svgData});
    };

    return (
        <div className="properties-panel">
            <h3>
                Pipes
            </h3>
            <div className="properties-panel__content">{html}</div>
        </div>
    );
}
