var models = {
    arena: {
        obj: "models/map.obj",
        mesh: null
    },
    echoOrange: {
        obj: "models/echo.obj",
        mesh: null
    },
    echoBlue: {
        obj: "models/echo.obj",
        mesh: null
    },
    floor: {
        obj: "models/floor1.obj",
        mesh: null
    },
    floorOutline: {
        obj: "models/floorOutline.obj",
        mesh: null
    },
    trans: {
        obj: "models/transparencys.obj",
        mesh: null
    }
};

/* three globals */
var scene, camera, controls, renderer, mesh;

/* our globals */
var ambient, light, orangeLight, blueLight;
var savedgame;
var meshes = {};
orangePlayers = [];
bluePlayers = [];

function init() {
    //Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1b1b1e);
    //  scene.background = new THREE.Color( 0x02020B );

    //Create Camera
    camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000);
    controls = new THREE.OrbitControls(camera);
    camera.position.set(200, 100, 200);
    camera.lookAt(0, 0, 0);
    controls.update();

    //Create Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.sortObjects = false;

    //Create Lighting
    ambient = new THREE.AmbientLight(0xFFFFFF, 1, 100);
    ambient.position.set(0, 10, 0);
    scene.add(ambient);

    light = new THREE.PointLight(0xffffff, 2, 100);
    light.position.set(0, -35, 30);
    scene.add(light);

    orangeLight = new THREE.PointLight(0xf76707, 2, 100);
    orangeLight.position.set(60, 0, 0);
    scene.add(orangeLight);

    blueLight = new THREE.PointLight(0x1c7ed6, 2, 100);
    blueLight.position.set(-20, 0, 0);
    scene.add(blueLight);

    //Object Loading Manager
    var loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = onResourcesLoaded;

    var arenaMat = new THREE.MeshPhysicalMaterial({
        side: THREE.Doubleside,
        color: 0x3433a40,
        roughness: 0.9,
        clearCoat: 1.,
        clearCoatRoughness: 1.0,
        reflectivity: .3,
    });
    var floorMat = new THREE.MeshPhysicalMaterial({
        color: 0x495057,
        roughness: 0.9,
        clearCoat: 1.,
        clearCoatRoughness: 1.0,
        reflectivity: .3,
    });

    var backMat = new THREE.MeshPhysicalMaterial({
        color: 0x343a40,
        roughness: 1,
        clearCoat: .7,
        clearCoatRoughness: 1.0,
        reflectivity: .1,
    });

    var outlineMat = new THREE.MeshPhysicalMaterial({
        color: 0xced4da,
        roughness: 0.9,
        clearCoat: 1.,
        clearCoatRoughness: 1.0,
        reflectivity: .2,
    });

    var transparentMat = new THREE.MeshPhysicalMaterial({
        color: 0xced4da,
    });

    // Start loading meshes, and when complete, call onResourcesLoaded
    var objLoader = new THREE.OBJLoader(loadingManager);
    for (var _key in models) {
        (function(key) {
            objLoader.load(models[key].obj, function(mesh) {
                mesh.traverse(function(node) {
                    if (node instanceof THREE.Mesh) {
                        if (key == "arena") {
                            node.material = arenaMat;
                            node.material.transparent = true,
                                node.material.opacity = .15,
                                node.castShadow = true;
                            node.receiveShadow = true;
                            node.scale.set(1, 1, 1);
                        } else if (key == "echoBlue") {
                            node.material = new THREE.MeshLambertMaterial({
                                color: 0x5333ff,
                                transparent: true,
                                opacity: 0.1,
                                wireframe: true,
                                wireframeLinewidth: 0.1
                            });
                            node.scale.set(.1, .1, .1);
                        } else if (key == "echoOrange") {
                            node.material = new THREE.MeshLambertMaterial({
                                color: 0xf46036,
                                transparent: true,
                                opacity: 0.1,
                                wireframe: true,
                                wireframeLinewidth: 0.1
                            });
                            node.scale.set(.1, .1, .1);
                        } else if (key == "floor") {
                            node.material = floorMat;
                            node.receiveShadow = true;
                            node.scale.set(1, 1, 1);
                        } else if (key == "floorOutline") {
                            node.material = outlineMat;
                            node.receiveShadow = true;
                            node.scale.set(1, 1, 1);
                        } else if (key == "trans") {
                            node.material = transparentMat;
                            node.material.transparent = true,
                                node.material.opacity = .15,
                                node.receiveShadow = true;
                            node.scale.set(1, 1, 1);
                        }

                    }
                });
                models[key].mesh = mesh;
            });
        })(_key);
    }

    /* FIXME: do this in another thread */
    var request = new XMLHttpRequest();
    request.open("GET", "data/game.json", false);
    request.send(null)
    savedgame = JSON.parse(request.responseText);
    savedgame['frames'];

    /* Show a loading screen */
    var loadingScreen = {
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100),
        box: new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshBasicMaterial({
                color: 0x4444ff
            })
        )
    };

    loadingScreen.box.position.set(0, 5, 5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);
}

function onResourcesLoaded() {
    meshes["echo0"] = models.echoBlue.mesh.clone();
    meshes["echo1"] = models.echoBlue.mesh.clone();
    meshes["echo2"] = models.echoBlue.mesh.clone();
    meshes["echo3"] = models.echoOrange.mesh.clone();
    meshes["echo4"] = models.echoOrange.mesh.clone();
    meshes["echo5"] = models.echoOrange.mesh.clone();
    meshes["arena"] = models.arena.mesh.clone();
    meshes["trans"] = models.trans.mesh.clone();
    meshes["floor"] = models.floor.mesh.clone();
    meshes["floorOutline"] = models.floorOutline.mesh.clone();

    orangePlayers.push(meshes["echo0"]);
    orangePlayers.push(meshes["echo1"]);
    orangePlayers.push(meshes["echo2"]);
    bluePlayers.push(meshes["echo3"]);
    bluePlayers.push(meshes["echo4"]);
    bluePlayers.push(meshes["echo5"]);
    for (var i = 0; i < 3; i++) {
        scene.add(orangePlayers[i]);
        scene.add(bluePlayers[i]);
    }


    meshes["arena"].position.set(-1, -2.5, 0);
    meshes["arena"].doubleSided = true;
    scene.add(meshes["arena"]);
    meshes["floor"].position.set(-1, -2.5, 0);
    scene.add(meshes["floor"]);
    meshes["floorOutline"].position.set(-1, -2.5, 0);
    scene.add(meshes["floorOutline"]);
    meshes["trans"].position.set(-1, -2.5, 0);
    scene.add(meshes["trans"]);

    run();
}

function run() {

    var ac = 0xff0000;
    var al = 2;
    var ad = new THREE.Vector3(0, 1, 0);
    var ao = new THREE.Vector3(0, 0, 0);

    for (var i = 0; i < 3; i++) {
        orangePlayers[i]['arrow'] = new THREE.ArrowHelper(ad, ao, al, ac);
        bluePlayers[i]['arrow'] = new THREE.ArrowHelper(ad, ao, al, ac);
        scene.add(orangePlayers[i]['arrow']);
        scene.add(bluePlayers[i]['arrow']);
    }

    /* Transform Echo VR coords to Three coords */
    var coordTransform = function(evr_coord) {
        var tf = [evr_coord[2], evr_coord[1], evr_coord[0]];
        return tf;
    }

    var setPlayerPosition = function(player, pos) {
        var ptf = coordTransform(pos);
        player.position.fromArray(ptf)
    }

    var updateArrow = function(arrow, pos, dir) {
        var ptf = coordTransform(pos);
        arrow.position.fromArray(ptf);
        var dtf = coordTransform(dir);
        arrow.setDirection(new THREE.Vector3(dtf[0], dtf[1], dtf[2]));
    }

    var updatePlayer = function(player, pf) {
        setPlayerPosition(player, pf.position);
        updateArrow(player.arrow, pf.position, pf.forward);
    }

    /* frame index */
    var idx = 0;

    var anim = function() {
        requestAnimationFrame(anim);


        frame = savedgame.frames[idx];
        idx += 1;

        for (var i = 0; i < 3; i++) {
            updatePlayer(orangePlayers[i], frame.teams[0].players[i]);
            updatePlayer(bluePlayers[i], frame.teams[1].players[i]);
        }

        controls.update();

        renderer.render(scene, camera);
    };


    anim();
}

window.onload = init;