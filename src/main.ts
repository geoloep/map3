import * as chroma from 'chroma-js';

import Renderer from './renderer/renderer';

import geoJsonLayer from './layer/geoJson';
import featureCollectionLayer  from './layer/vector/featureCollection';

let container = (document.getElementById('kaart') as HTMLElement);

let renderer = new Renderer(container);

let views = {
    dichtheidkm2: {
        naam: 'Bevolkingsdichtheid per km²',
        key: 'bevolkingsdichtheid_inwoners_per_km2',
        schaal: chroma.scale('RdYlGn').domain([2000, 25]),
        vergroting: 5,
        norm: 0,
    },
    allochtnw: {
        naam: 'Percentage niet westerse allochtonen',
        key: 'percentage_niet_westerse_allochtonen',
        schaal: chroma.scale('PRGn').domain([1, 30]),
        vergroting: 500,
        norm: 0,
    },
    allochtww: {
        naam: 'Percentage westerse allochtonen',
        key: 'percentage_westerse_allochtonen',
        schaal: chroma.scale('PRGn').domain([1, 26]),
        vergroting: 500,
        norm: 0,
    },
    eenpershuishouden: {
        naam: 'Percentage eenpersoonshuishoudens',
        key: 'percentage_eenpersoonshuishoudens',
        schaal: chroma.scale('RdYlGn').domain([62, 19]),
        vergroting: 500,
        norm: 10,
    },
    nvtjaar: {
        naam: 'Percentage 0 - 15 jaar',
        key: 'percentage_personen_0_tot_15_jaar',
        schaal: chroma.scale('RdYlGn').domain([10, 22]),
        vergroting: 500,
        norm: 8,
    },
    vtvtjaar: {
        naam: 'Percentage 15 - 25 jaar',
        key: 'percentage_personen_15_tot_25_jaar',
        schaal: chroma.scale('RdYlGn').domain([6, 24]),
        vergroting: 500,
        norm: 5,
    },
    vtvvjaar: {
        naam: 'Percentage 25 - 45 jaar',
        key: 'percentage_personen_25_tot_45_jaar',
        schaal: chroma.scale('RdYlGn').domain([15, 35]),
        vergroting: 500,
        norm: 8,
    },
    vvvzvjaar: {
        naam: 'Percentage 45 - 65 jaar',
        key: 'percentage_personen_45_tot_65_jaar',
        schaal: chroma.scale('RdYlGn').domain([19, 35]),
        vergroting: 500,
        norm: 12,
    },
    zvplus: {
        naam: 'Percentage 65+',
        key: 'percentage_personen_65_jaar_en_ouder',
        schaal: chroma.scale('RdYlGn').domain([30, 10]),
        vergroting: 500,
        norm: 8,
    },
};

let view = views.allochtnw;

(async () => {
    let data = await fetch('data/gemeenten.geojson');

    let json = await data.json();

    let brewer: any = chroma.scale('RdYlGn').domain([2000, 25]);

    let layer = new featureCollectionLayer(json, (feature: GeoJSON.Feature<any>) => {
        return {
            light: true,
            color: (view.schaal((feature.properties as any)[view.key]) as any).css(),
            extrude: ((feature.properties as any)[view.key] - view.norm) * view.vergroting,
        };
    });

    let mesh = layer.mesh();

    renderer.scene.add(mesh);
    renderer.render();
})();
