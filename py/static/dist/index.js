!function(e){var t={};function i(r){if(t[r])return t[r].exports;var s=t[r]={i:r,l:!1,exports:{}};return e[r].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=e,i.c=t,i.d=function(e,t,r){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(i.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)i.d(r,s,function(t){return e[t]}.bind(null,s));return r},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=0)}([function(e,t,i){angular.module("srirama",[]),i(1),i(2)},function(e,t){angular.module("srirama").service("api",["$http","$q",class{constructor(e,t){this.http=e,this.q=t,this.urlServer="http://localhost:4343"}getDatasets(){var e=this.q.defer();return this.http.get(`${this.urlServer}/api/getdatasets`).then(t=>{t=t.data,e.resolve(t)}),e.promise}getDataPointTimeSeries(e,t,i=null,r=null){null!==i&&null!==r&&(this.id=i,this.key=r);var s=this.q.defer();return this.http({url:`${this.urlServer}/api/getdatapointtimeseries`,method:"GET",params:{id:this.id,key:this.key,select:JSON.stringify(e),lat:t.lat,lon:t.lng}}).then(e=>{e=e.data,s.resolve(e)}),s.promise}}])},function(e,t,i){angular.module("srirama").component("dashboardContainer",{template:i(3),controller:["api","$q","$scope",class{constructor(e,t,i){this.api=e,this.q=t,this.scope=i,this.data=[{id:0,key:"ts",select:{}},{id:0,key:"rhscrn",select:{}},{id:0,key:"rnet",select:{}},{id:0,key:"alb_ave",select:{}},{id:0,key:"rnd24",select:{}},{id:0,key:"d10",select:{}},{id:0,key:"cld",select:{}},{id:0,key:"convh_ave",select:{lev:200}},{id:0,key:"hfls",select:{}},{id:0,key:"hfss",select:{}},{id:0,key:"mrros",select:{}},{id:0,key:"pmsl_ave",select:{}},{id:0,key:"tsea",select:{}},{id:0,key:"dustwd_ave",select:{}},{id:0,key:"dustdd_ave",select:{}},{id:0,key:"u200",select:{}},{id:0,key:"u850",select:{}},{id:0,key:"sfcwind",select:{}}],this.data.forEach((e,t)=>{this.data[t].select={...e.select,...{time:["1999-01","1999-12"]}}})}$onInit(){this.getLocation().then(e=>{this.latlng=e,this.updateDataFromDatasets().then(()=>{this.scope.data=this.data,this.scope.graphs=[],this.getTimeSeries(0).then(()=>{this.getTimeSeries(1).then(()=>{this.getTimeSeries(2).then(()=>{this.getTimeSeries(3)})})})})})}updateDataFromDatasets(){let e=this.q.defer();return this.api.getDatasets().then(t=>{t.forEach(e=>{this.data.forEach((t,i)=>{e.id===t.id&&e.keys.forEach(e=>{e.key===t.key&&(this.data[i]={...this.data[i],...e})})})}),e.resolve(this.data)}),e.promise}getTimeSeries(e){return this.api.getDataPointTimeSeries(this.data[e].select,this.latlng,this.data[e].id,this.data[e].key).then(e=>{this.scope.graphs.unshift(e),console.log("getTimeSeries",e)})}getLocation(){let e=this.q.defer();const t={lat:-6.894,lng:107.586};return navigator.geolocation?navigator.geolocation.getCurrentPosition(({coords:t})=>{e.resolve({lat:t.latitude,lng:t.longitude})},i=>{e.resolve(t)}):e.resolve(t),e.promise}}]})},function(e,t){e.exports='<div ng-repeat="_data in data"> <button ng-click=$ctrl.getTimeSeries($index)>{{_data.long_name}}</button> <br> </div> <br> {{graphs[0]}} <br> <br> {{graphs[1]}} <br> <br> {{graphs[2]}} <br> <br> {{graphs[3]}}'}]);