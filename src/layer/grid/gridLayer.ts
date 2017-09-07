import { ILayer } from '../layer';

import Map from '../../map';

import { Group, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, PlaneBufferGeometry, TextureLoader, WireframeGeometry } from 'three';

export default class GridLayer implements ILayer {
    material: Material;
    map: Map;

    mesh = new Group();


    constructor() {
        const geom = new PlaneBufferGeometry(100000, 100000);

        geom.translate(142892.19, 470783.87, 0);

        // this.mesh = new Mesh(geom);
        // this.mesh.add(new Mesh(geom));
        // this.mesh.
    }

    createTiles(zoom: number) {
        const scale = this.map.projection.resolution(zoom);
        const bounds = this.map.getBounds();

        const tileSize = this.map.projection.tileSize * scale;

        console.log(bounds);
    }

    addImage() {
        // const loader = new TextureLoader();
        // loader.crossOrigin = '';

        // const url = 'http://geodata.nationaalgeoregister.nl/wmts/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=brtachtergrondkaartgrijs&TILEMATRIXSET=EPSG:28992&TILEMATRIX=EPSG:28992:5&TILEROW=14&TILECOL=16&FORMAT=image/png';

        // loader.load(url, (texture) => {
        //     this.material = new MeshBasicMaterial({
        //         map: texture,
        //     });

        //     this.mesh.material = this.material;
        // });
    }

    onAdd(map: Map) {
        this.map = map;

        this.createTiles(5);
    }
}
