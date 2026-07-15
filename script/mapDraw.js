
window.mapDrawing =  (function() {
    
    const viewer = window.CesiumViewer;

    let tileset;

    //viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

    function wmssatilite() {
        viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

        var world = new Cesium.WebMapServiceImageryProvider({
            url : "http://10.240.33.120/cgi-bin/mapserv.exe?map=/ms4w/apps/local-demo/ne1_hr.map",
            // map: "/ms4w/apps/local-demo/land_200m.map",
            layers : "NE1_HR",
            parameters : {
            transparent : true,
            format : "image/png",
            tiled: true,
            enablePickFeatures: true
        },
        });
        viewer.imageryLayers.addImageryProvider(world);
        viewer.imageryLayers._layers[0].show = true;
    }

    /*******************************************************************************
    //
    //  tilemap service(TMS)
    //
    *******************************************************************************/

    function tilemap() {
        var tms = Cesium.TileMapServiceImageryProvider.fromUrl(
            "../Source/Assets/Textures/NaturalEarthII/", {
            fileExtension: 'jpg',
            maximumLevel: 8,
            

        });
        viewer.imageryLayers.addImageryProvider(tms);
    }

    /*******************************************************************************
    //
    //  Add a WMS imagery layer
    //  CADRG  WMS 처리
    //
    *******************************************************************************/    
    function air_200() {
        var air_200 = new Cesium.WebMapServiceImageryProvider({
                url : "http://localhost/cgi-bin/mapserv.exe?map=/ms4w/apps/local-demo/cadrg_5.map",
                // map: "/ms4w/apps/local-demo/land_200m.map",
                layers : "cadrg_5m",
                parameters : {
                transparent : true,
                format : "image/png",
                tiled: true,  
                //enablePickFeatures: true
            },
        });

        viewer.imageryLayers.addImageryProvider(air_200);
        viewer.imageryLayers._layers[1].show = false;
    };

/* 
   var  wfs = new Cesium.WebMapServiceImageryProvider({
        url : "http://localhost/cgi-bin/mapserv.exe?map=/ms4w/apps/local-demo/fdb_l100m.map",
        // map: "/ms4w/apps/local-demo/land_200m.map",
        layers : "ABA030",
        parameters : {
        transparent : true,
        format : "image/png",
        tiled: true,
        enablePickFeatures: true
      },
    });
    viewer.imageryLayers.addImageryProvider(wfs);
    viewer.imageryLayers._layers[2].show = false;
*/

    function cib() {
        var cib = new Cesium.WebMapServiceImageryProvider({
            url : "http://localhost/cgi-bin/mapserv.exe?map=/ms4w/apps/local-demo/cib2.map",
            // map: "/ms4w/apps/local-demo/land_200m.map",
            layers : "cib",
            parameters : {
            transparent : true,
            format : "image/png",
            tiled: true,
            //enablePickFeatures: true
        },
        });
        viewer.imageryLayers.addImageryProvider(cib);
        viewer.imageryLayers._layers[2].show = false;
    }

 
    function geojsonCreate() { 
        var url = "http://localhost/cgi-bin/mapserv.exe?Service=WFS&map=/ms4w/apps/local-demo/shape.map&version=2.0.0&srs=epsg:4326&request=GetFeature&TYPENAME=LBA010&outputformat=geojson";
        const promise = Cesium.GeoJsonDataSource.load(url);
        promise.then(function(dataSource) {
            viewer.dataSources.add(dataSource);
        
            const colorHash = {};
            var entities = dataSource.entities.values;
            
            for (var i = 0; i < entities.length; i++) 
            {
                var entity = entities[i];
                
                const name = entity.name;
                let color = colorHash[name];
                if (!color) {
                    //color = Cesium.Color.fromRandom({
                    //alpha: 1.0,
                    //});
                    colorHash[name] = Cesium.Color.RED;
                }
                //Set the polygon material to our random color.
                entity.polyline.material = color;
                //Remove the outlines.
                entity.polyline.outline = false;
            }
        })
        .catch(function(error) {
            window.alert(error);
        });
    };



    async function ModelDraw() {
        //let  tileset;
        try {
            tileset = await Cesium.createOsmBuildingsAsync({
            style: new Cesium.Cesium3DTileStyle({
                color: {
                    conditions: [
                        ["${feature['building']} === 'hospital'", "color('#0000FF')"],
                        ["${feature['building']} === 'school'", "color('#00FF00')"],
                        [true, "color('#ffffff')"]
                    ]
                }
            })
        });
            viewer.scene.primitives.add(tileset);
            viewer.scene.globe.depthTestAgainstTerrain = true;

            tileset.show = false;
            //viewer.scene.terrainProvider = terrainProvider;
            //updateTileset(tileset.root);
        // 
        //    var boundingSphere = tileset.boundingSphere;
        //    viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.5, -6.2, boundingSphere.radius * 1.0));
        //    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        //  
        } catch (error) {
            console.log(`Error creating tileset: ${error}`);
        }
    };

    function toggleTilesetVisibility() {
        if (tileset) {
            tileset.show = !tileset.show;
        } else {
            console.error('Tileset is not initialized.');
        }
    };

    // DOM이 로드된 후 작업 실행
    document.addEventListener('DOMContentLoaded', function() {
        // 초기화 시 ModelDraw 호출
        ModelDraw();
    });

    return {tilemap, air_200, cib, geojsonCreate,  wmssatilite, ModelDraw, toggleTilesetVisibility};

})();