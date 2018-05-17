var u = navigator.userAgent;
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
var camera, scene, renderer;
var geometry, material, mesh;
var target = new THREE.Vector3();
// 设置经纬度
var angle = 80 ;
var lon = 0, lat = 0;
var phi = 0, theta = 0;
var touchX, touchY;
isiOS?angle=100.5:angle=80;
init();
animate();

function init() {
    /**
    * 添加相机
     * @type {THREE.PerspectiveCamera}
     */
    camera = new THREE.PerspectiveCamera( 
        75, // 相机视角的夹角  （同时可以设置视角距离远近）
        window.innerWidth / window.innerHeight,  // 相机画幅比
        1, // 最近焦距
        1000 // 最远焦距
        ); 
    /**
     * 创建场景
     * @type {THREE.Scene}
     */
    scene = new THREE.Scene();

    /**
     *正方体的6个面的资源及相关（坐标、旋转等）设置
     */
    var flipAngle = Math.PI, // 180度
        rightAngle = flipAngle / 2, // 90度
        tileWidth = 360; 
    var sides = [{
        url: "images/bg_section_6.jpg", //right
        position: [-tileWidth, 0, 0],
        rotation: [0, rightAngle, 0]
    }, {
        url: "images/bg_section_5.jpg", //left    
        position: [tileWidth, 0, 0],
        rotation: [0, -rightAngle, 0]
    }, {
        url: "images/bg_section_4.jpg", //top
        position: [0, tileWidth, 0],
        rotation: [rightAngle, 0, Math.PI*-1.5]
    }, {
        url: "images/bg_section_3.jpg", //bottom
        position: [0, -tileWidth, 0],
        rotation: [-rightAngle, 0, Math.PI]
    }, {
        url: "images/bg_section_2.jpg", //front
        position: [0, 0, tileWidth],
        rotation: [0, Math.PI, 0]
    }, {
        url: "images/bg_section_1.jpg", //back
        position: [0, 0, -tileWidth],
        rotation: [0, 0, 0]
    }];

    for ( var i = 0; i < sides.length; i ++ ) {
        var side = sides[ i ];
        var element = document.getElementById("bg_section_"+i);
        element.width = 720;
        element.height = 720; // 2 pixels extra to close the gap.
        // 添加一个渲染器
        var object = new THREE.CSS3DObject( element );
        object.position.fromArray( side.position );
        object.rotation.fromArray( side.rotation );
        scene.add( object );

    }

    renderer = new THREE.CSS3DRenderer(); // 定义渲染器
    renderer.setSize( window.innerWidth, window.innerHeight ); // 定义尺寸
    document.body.appendChild( renderer.domElement ); // 将场景到加入页面中

    initDevices();
    initMouseControl();
}
// 初始化控制器
function initMouseControl() {
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'wheel', onDocumentMouseWheel, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
}
/**	
 * 窗体大小改变
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
// 初始化陀螺仪
function initDevices() {
    deviceControl = new THREE.DeviceOrientationControls(camera);
}
/*
    相机焦点跟着鼠标或手指的操作移动
     */
    function onDocumentMouseDown( event ) {
        event.preventDefault();
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );

    }

    function onDocumentMouseMove( event ) {
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        lon -= movementX * 0.1;
        lat += movementY * 0.1;
    }

    function onDocumentMouseUp( event ) {
        document.removeEventListener( 'mousemove', onDocumentMouseMove );
        document.removeEventListener( 'mouseup', onDocumentMouseUp );
    }

    /**
     * 鼠标滚轮改变相机焦距
     */
    function onDocumentMouseWheel( event ) {
        camera.fov += event.deltaY * 0.05;
        camera.updateProjectionMatrix();
    }

    function onDocumentTouchStart( event ) {
        event.preventDefault();
        var touch = event.touches[ 0 ];
        touchX = touch.screenX;
        touchY = touch.screenY;

    }

    function onDocumentTouchMove( event ) {
        event.preventDefault();
        var touch = event.touches[ 0 ];
        lon -= ( touch.screenX - touchX ) * 0.1;
        lat += ( touch.screenY - touchY ) * 0.1;
        touchX = touch.screenX;
        touchY = touch.screenY;

    }

/**
 * 实时渲染函数
 */
function animate() {
    requestAnimationFrame(animate);
    // lon = Math.max(-180, Math.min(180, lon));//限制固定角度内旋转
    // lon += 0.1;//自动旋转
    lat = Math.max(-60, Math.min(60, lat)); //限制固定角度内旋转
    phi = THREE.Math.degToRad(85 - lat);
    theta = THREE.Math.degToRad(lon+180);
    target.x = Math.sin(phi) * Math.cos(theta);
    target.y = Math.cos(phi);
    target.z = Math.sin(phi) * Math.sin(theta);
    camera.lookAt( target );
    camera.updateProjectionMatrix();
    // 判断执行方法，是否开启陀螺仪判断方位
   initMouseControl();
   deviceControl.updateAlphaOffsetAngle(angle);
    renderer.render(scene, camera);
}
