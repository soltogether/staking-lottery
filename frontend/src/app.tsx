
import type { FC } from 'react';
import React from 'react';
import Content from "./content";
import Context from "./context";


export const App: FC = () => {
    return <div>
        <Context>
            <Content />
        </Context>
    </div>;
};

