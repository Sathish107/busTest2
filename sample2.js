var slat,slong,map
var dlat,dlong,a=1 
var reset=0
var lat,long; 
var currentZoomLevel=13;
var dmarker,smarker;
var firstTime=1
var statusCode=200

const myMarker=L.icon({
    iconUrl:'myMarker1.png',
    iconSize:[40,40]
}) 

var polyline
const coordinates=[]
const slopes=[]
var c=1
const newCoordinates=[] 


navigator.geolocation.getCurrentPosition((position)=>{
    togglePopup(); 
    slat=position.coords.latitude
    slong=position.coords.longitude
    map = L.map('map').setView([slat,slong],13)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19 
    }).addTo(map);  

    map.on('click',async (e)=>{
        if(firstTime){
            dlat=e.latlng.lat
            dlong=e.latlng.lng

            dmarker=L.marker([dlat,dlong],map.getZoom()).addTo(map).bindPopup('<b>Destination</b>').openPopup()

            togglePopup1()

            firstTime=0
        }
    })

})

var setTimeId
const updateLocation =  () => {
    if(statusCode===200){
        statusCode=400
        markLocation(); 
    }
    setTimeId=setTimeout(updateLocation, 1000);
};


const markLocation= ()=>{ 
    navigator.geolocation.getCurrentPosition(async (position)=>{ 

        lat=position.coords.latitude
        long=position.coords.longitude

        coordinates.push([lat,long])
        const response=await fetch('https://busserver.onrender.com/bus/route',{
            method:'PUT',
            headers:{
                'content-Type':'application/json'
            },
            body:JSON.stringify({
                id:'65734c5fe146b4a1557719d8',
                coordinates:`[${lat},${long}]`
            })
        })
 
        statusCode=await response.status
        await console.log(statusCode)
        console.log(coordinates)

        if(smarker){ 
            smarker
            .setLatLng([lat,long],{icon:myMarker})
            .bindPopup("This is my <b>location</b>")
            .openPopup()

            map.flyTo([lat,long],map.getZoom(),{
                duration:1.2
            }) 

        }else{
            map.flyTo([lat,long],map.getZoom(),{
                duration:2.3
            })

            smarker=L.marker([lat,long],{icon:myMarker}) 
            .addTo(map)
            .bindPopup("<b>you are here</b>")
            .openPopup() 
        }

        if((dlat-lat<0.00012 && dlat -lat>-0.00012) && (dlong -long<0.00012 && dlong - long>-0.00012)){
            c=0
        } 


        if(!c){ 
    
            for(var i=0;i<coordinates.length-1;i++){
                slopes[i]=(coordinates[i+1][1]-coordinates[i][1])/(coordinates[i+1][0]-coordinates[i][0])
            } 
    
            polyline = L.polyline(coordinates, {
                color: 'red',
                smoothFactor:0.0001
            }).addTo(map);
    
            setTimeout(()=>{
                map.removeLayer(polyline)
            },2000)
    
            setTimeout(()=>{
                plotNewCoord()
            },4000)

            clearTimeout(setTimeId)
        }

        
    }) 

}  

const plotNewCoord=()=>{

    for(var i=0,
        pos=0; 
        i<slopes.length-1;i++){ 
        while(slopes[i+1+pos]-slopes[i]<=0.07 && slopes[i+1+pos]-slopes[i]>=0){
            coordinates[i+1+pos]=0
            pos++
        }
        while(slopes[i+1+pos]-slopes[i]>=-0.07 && slopes[i+1+pos]-slopes[i]<0){
            coordinates[i+1+pos]=0
            pos++
        }
        newCoordinates.push(coordinates[i])
        i+=pos
        pos=0
    }
     
    if(coordinates[coordinates.length-2]){
        newCoordinates.push(coordinates[coordinates.length-2])
    }
    
    newCoordinates.push(coordinates[coordinates.length-1])  
    
    console.log(`no of coordinates: ${coordinates.length} \n 
    no of newCoordinates: ${newCoordinates.length} \n
    no of coordinates saved: ${coordinates.length - newCoordinates.length}
    `)

    polyline = L.polyline(newCoordinates, {
        color: 'red',
        smoothFactor:0.0001
    }).addTo(map);

}

const togglePopup1=()=>{
    document.getElementById('popup1').style.display='block'
    document.getElementById('overlay').style.display='block' 
}

const closePopup1=()=>{
    document.getElementById('popup1').style.display = 'none';
    document.getElementById('overlay').style.display='none'  
    updateLocation()
}


function togglePopup() {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('overlay').style.display='block'
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('overlay').style.display='none'
}

 
