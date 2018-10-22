import plot
from flask_cors import CORS
from flask import Flask, request, jsonify, send_file, json
import xarray
import numpy
import pandas


class Datasets():
    __datasets = []
    __countId = -1

    def __init__(self):
        self.__addDatasets(
            filePath='D:/project/data_nc/ccam_gfdlcm3_mon.194901_209911.nc')

    def __addDatasets(self, filePath):
        Datasets.__countId += 1
        Datasets.__datasets.append({
            'id': Datasets.__countId,
            'dataset': xarray.open_dataset(filePath)
        })

    def __getLegend(self, datasel):
        res = {}
        res['legends'] = []
        res['units'] = datasel.units
        max = datasel.max().data.tolist()
        min = datasel.min().data.tolist()
        n = 6
        for i in range(0, n):
            legend = (((max - min) / (n - 1)) * i) + min
            res['legends'].append(legend)
        return res

    def __getStartEndYear(self, projection):
        projections = [
            {
                'projection': '1980',
                'startYear': '1951',
                'endYear': '1980'
            },
            {
                'projection': '1990',
                'startYear': '1961',
                'endYear': '1990'
            },
            {
                'projection': '2000',
                'startYear': '1971',
                'endYear': '2000'
            },
            {
                'projection': '2005',
                'startYear': '1976',
                'endYear': '2005'
            },
            {
                'projection': '2020s',
                'startYear': '2010',
                'endYear': '2039'
            },
            {
                'projection': '2030s',
                'startYear': '2020',
                'endYear': '2049'
            },
            {
                'projection': '2040s',
                'startYear': '2030',
                'endYear': '2059'
            },
            {
                'projection': '2050s',
                'startYear': '2040',
                'endYear': '2069'
            },
            {
                'projection': '2060s',
                'startYear': '2050',
                'endYear': '2079'
            }
        ]
        for _projection in projections:
            if _projection['projection'] == projection:
                return {
                    'startYear': _projection['startYear'],
                    'endYear': _projection['endYear']
                }

    """
    getDataPointTimeSeries
    parameter
    select = {'time': [<time 1>, <time 2>]}
    """

    def getDataPointTimeSeries(self, id, key, select, latlng):
        for dataset in Datasets.__datasets:
            if dataset['id'] == id:
                datasel = dataset['dataset'][key]
                # select lat
                dimsLatName = datasel.dims[-2]
                select[dimsLatName] = latlng['lat']
                # select lng
                dimsLngName = datasel.dims[-1]
                select[dimsLngName] = latlng['lng']
                # select time
                dimsTimeName = datasel.dims[0]
                select[dimsTimeName] = dataset['dataset'][dimsTimeName].loc[select[dimsTimeName]
                                                                            [0]:select[dimsTimeName][1]].data
                select['method'] = 'nearest'
                datasel = datasel.sel(**select)
                return datasel

    """
    getDatasets
    result
    res = [
        {
            'id': <id>, 
            'keys': [
                'dims': [
                    <key>,
                    ...
                ],
                'key': <key>,
                'long_name': <long name>,
                'units': <units>
            ]
        },
        ...
    ]
    """

    def getDatasets(self):
        res = []
        for dataset in Datasets.__datasets:
            _res = {}
            _res['id'] = dataset['id']
            _res['keys'] = []
            for key in dataset['dataset'].keys():
                __res = {}
                __res['key'] = key
                try:
                    __res['long_name'] = str(dataset['dataset'][key].long_name)
                    __res['units'] = str(dataset['dataset'][key].units)
                except AttributeError:
                    __res['long_name'] = str(key)
                    __res['units'] = ''
                __res['dims'] = dataset['dataset'][key].dims
                _res['keys'].append(__res)
            res.append(_res)
        return res

    """
    getValsDimsWithoutLatLon
    result
    res = [
        {
            'key': <key>,
            'values': [
                <values>,
                ...
            ]
        },
        ...
    ]
    """

    def getValsDimsWithoutLatLon(self, id, key):
        res = []
        for dataset in Datasets.__datasets:
            if dataset['id'] == id:
                _dataset = dataset['dataset'][key]
                _dimswolatlon = _dataset.dims[0:-2]
                for key in _dimswolatlon:
                    temp = {}
                    temp['key'] = key
                    if type(_dataset[key].data[0]) is numpy.datetime64:
                        temp['values'] = _dataset[key].data.astype(
                            str).tolist()
                    else:
                        temp['values'] = _dataset[key].data.tolist()
                    res.append(temp)
        return res

    """
    getLayerHeader
    result
    res = {
        'bounds': [
            <barat, selatan (latlng)>,
            <timur, utara (latlng)>
        ],
        'legends': [
            <legends>,
            ...
        ],
        'long_name': <long name>,
        'units': <units>
    }
    """

    def getLayerHeader(self, id, key, select):
        res = {}
        datasel = self.getLayerOrPoint(id=id, key=key, select=select)
        lat = datasel[datasel.dims[-2]].data
        minlat = numpy.amin(lat).item()
        maxlat = numpy.amax(lat).item()
        lon = datasel[datasel.dims[-1]].data
        minlon = numpy.amin(lon).item()
        maxlon = numpy.amax(lon).item()
        res['bounds'] = [[minlat, minlon], [maxlat, maxlon]]
        res['long_name'] = datasel.long_name
        legend = self.__getLegend(datasel)
        res['units'] = legend['units']
        res['legends'] = legend['legends']
        return res

    """
    getLayerOrPoint
    """

    def getLayerOrPoint(self, id, key, select, latlng=None):
        if latlng == None:
            for dataset in Datasets.__datasets:
                if dataset['id'] == id:
                    datasel = dataset['dataset'][key].sel(**select)
                    return datasel
        else:
            for dataset in Datasets.__datasets:
                if dataset['id'] == id:
                    datasel = dataset['dataset'][key]
                    select[datasel.dims[-2]] = latlng['lat']
                    select[datasel.dims[-1]] = latlng['lng']
                    select['method'] = 'nearest'
                    datasel = dataset['dataset'][key].sel(**select)
                    return datasel

    """
    getLayerHeaderCropped
    result
    res = {
        'bounds': [
            <barat, selatan (latlng)>,
            <timur, utara (latlng)>
        ],
        'legends': [
            <legends>,
            ...
        ],
        'long_name': <long name>,
        'units': <units>
    }
    """

    def getLayerHeaderCropped(self, id, key, select, bounds):
        res = {}
        datasel = self.getLayerCropped(
            id=id, key=key, select=select, bounds=bounds)
        lat = datasel[datasel.dims[-2]].data
        minlat = numpy.amin(lat).item()
        maxlat = numpy.amax(lat).item()
        lon = datasel[datasel.dims[-1]].data
        minlon = numpy.amin(lon).item()
        maxlon = numpy.amax(lon).item()
        res['bounds'] = [[minlat, minlon], [maxlat, maxlon]]
        res['long_name'] = datasel.long_name
        legend = self.__getLegend(datasel)
        res['units'] = legend['units']
        res['legends'] = legend['legends']
        return res

    """
    getLayerCropped
    """

    def getLayerCropped(self, id, key, select, bounds):
        for dataset in Datasets.__datasets:
            if dataset['id'] == id:
                datasel = dataset['dataset'][key]
                lat1 = dataset['dataset'][datasel.dims[-2]
                                          ].sel(**{datasel.dims[-2]: bounds['lat'][0], 'method': 'nearest'})
                lat2 = dataset['dataset'][datasel.dims[-2]
                                          ].sel(**{datasel.dims[-2]: bounds['lat'][1], 'method': 'nearest'})
                lng1 = dataset['dataset'][datasel.dims[-1]
                                          ].sel(**{datasel.dims[-1]: bounds['lng'][0], 'method': 'nearest'})
                lng2 = dataset['dataset'][datasel.dims[-1]
                                          ].sel(**{datasel.dims[-1]: bounds['lng'][1], 'method': 'nearest'})
                select[datasel.dims[-2]
                       ] = dataset['dataset'][datasel.dims[-2]].loc[lat1: lat2]
                select[datasel.dims[-1]
                       ] = dataset['dataset'][datasel.dims[-1]].loc[lng1: lng2]
                datasel = dataset['dataset'][key].sel(**select)
                return datasel

    def getDataPointMinOrMax(self, id, key, minormax, select):
        for dataset in Datasets.__datasets:
            if dataset['id'] == id:
                datasel = dataset['dataset'][key]
                select[datasel.dims[0]] = dataset['dataset'][datasel.dims[0]
                                                             ].loc[select[datasel.dims[0]][0]:select[datasel.dims[0]][1]]
                datasel = dataset['dataset'][key].sel(**select)
                if request.args.get('minormax') == 'min':
                    datasel = datasel.where(
                        datasel == datasel.min(), drop=True)
                elif request.args.get('minormax') == 'max':
                    datasel = datasel.where(
                        datasel == datasel.max(), drop=True)
                datasel[datasel.dims[0]].data = datasel[datasel.dims[0]
                                                        ].data.astype(str).tolist()
                res = {
                    'dims': numpy.flip(datasel.to_dict()['coords'].keys()).tolist(),
                    'data': []
                }
                for _data in datasel:
                    for _datay in _data:
                        for _datax in _datay:
                            if numpy.isnan(_datax) == False:
                                _res = {}
                                _res['data'] = _datax.data.tolist()
                                for dim in res['dims']:
                                    _res[dim] = _datax[dim].data.tolist()
                                res['data'].append(_res)
                return res

    def getLayerOrPointAnomali(self, id, key, select, projection, latlng=None):
        if latlng == None:
            actual = self.getLayerOrPoint(id=id, key=key, select=select)
            month = actual.coords[actual.coords.keys(
            )[-1]].data.astype('datetime64[M]').astype(int) % 12 + 1
            year = self.__getStartEndYear(projection=projection)
            timeSel = pandas.date_range(start=(year['startYear'] + '-01'), end=(
                year['endYear'] + '-12'), freq='AS').shift(30 * (month - 1) + 14, freq='D')
            climatology = None
            for dataset in Datasets.__datasets:
                if dataset['id'] == id:
                    datasel = dataset['dataset'][key]
                    selectClimatology = select.copy()
                    selectClimatology[datasel.dims[0]] = timeSel
                    selectClimatology['method'] = 'nearest'
                    climatology = datasel.sel(**selectClimatology).resample(
                        '1MS', dim='time', how='mean').groupby('time.month').mean('time')[month - 1]
            anomaly = actual - climatology
            anomaly.attrs = actual.attrs
            return anomaly
        else:
            actual = self.getLayerOrPoint(
                id=id, key=key, select=select, latlng=latlng)
            month = actual.coords[actual.coords.keys(
            )[-1]].data.astype('datetime64[M]').astype(int) % 12 + 1
            year = self.__getStartEndYear(projection=projection)
            timeSel = pandas.date_range(start=(year['startYear'] + '-01'), end=(
                year['endYear'] + '-12'), freq='AS').shift(30 * (month - 1) + 14, freq='D')
            climatology = None
            for dataset in Datasets.__datasets:
                if dataset['id'] == id:
                    datasel = dataset['dataset'][key]
                    selectClimatology = select.copy()
                    selectClimatology[datasel.dims[0]] = timeSel
                    selectClimatology[datasel.dims[-2]] = latlng['lat']
                    selectClimatology[datasel.dims[-1]] = latlng['lng']
                    selectClimatology['method'] = 'nearest'
                    climatology = datasel.sel(**selectClimatology).resample(
                        '1MS', dim='time', how='mean').groupby('time.month').mean('time')[month - 1]
            anomaly = actual - climatology
            anomaly.attrs = actual.attrs
            return anomaly

    def getLayerHeaderAnomali(self, id, key, select, projection):
        res = {}
        datasel = self.getLayerOrPointAnomali(
            id=id, key=key, select=select, projection=projection)
        lat = datasel[datasel.dims[-2]].data
        minlat = numpy.amin(lat).item()
        maxlat = numpy.amax(lat).item()
        lon = datasel[datasel.dims[-1]].data
        minlon = numpy.amin(lon).item()
        maxlon = numpy.amax(lon).item()
        res['bounds'] = [[minlat, minlon], [maxlat, maxlon]]
        res['long_name'] = datasel.long_name
        legend = self.__getLegend(datasel)
        res['units'] = legend['units']
        res['legends'] = legend['legends']
        return res

    def getDataPointTimeSeriesAnomali(self, id, key, select, latlng, projection):
        actual = self.getDataPointTimeSeries(
            id=id, key=key, select=select, latlng=latlng)
        year = self.__getStartEndYear(projection=projection)
        timeSel = pandas.date_range(
            start=year['startYear'] + '-01', end=year['endYear'] + '-12', freq='MS').shift(14, freq='D')
        climatology = None
        for dataset in Datasets.__datasets:
            if dataset['id'] == id:
                datasel = dataset['dataset'][key]
                selectClimatology = select.copy()
                selectClimatology[datasel.dims[0]] = timeSel
                selectClimatology['method'] = 'nearest'
                climatology = datasel.sel(**selectClimatology).resample(
                    '1MS', dim='time', how='mean').groupby('time.month').mean('time')
        anomaly = actual.resample(time='1MS').mean(
            actual.coords.keys()[-1]).groupby('time.month') - climatology
        anomaly.attrs = actual.attrs
        return anomaly


datasets = Datasets()


app = Flask(__name__, static_url_path="", static_folder="static")
CORS(app, resources=r'/api/*')


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/getdatasets')
def getdatasets():
    hasil = datasets.getDatasets()
    return jsonify(hasil)


@app.route('/api/getdatapointtimeseries')
def getdatapointtimeseries():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    latlng = json.loads(request.args.get('latlng'))
    latlng['lat'] = float(latlng['lat'])
    latlng['lng'] = float(latlng['lng'])
    select = json.loads(request.args.get('select'))
    hasil = datasets.getDataPointTimeSeries(
        id=id, key=key, select=select, latlng=latlng).to_dict()
    return jsonify(hasil)


@app.route('/api/getdimswolatlon')
def getdimswolatlon():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    hasil = datasets.getValsDimsWithoutLatLon(id=id, key=key)
    return jsonify(hasil)


@app.route('/api/getlayerheader')
def getlayerheader():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    select = json.loads(request.args.get('select'))
    hasil = datasets.getLayerHeader(id=id, key=key, select=select)
    return jsonify(hasil)


@app.route('/api/getlayer')
def getlayer():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    select = json.loads(request.args.get('select'))
    hasil = plot.toPngResponse(
        datasets.getLayerOrPoint(id=id, key=key, select=select))
    return send_file(hasil, mimetype='image/png')


@app.route('/api/getdatapoint')
def getdatapoint():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    latlng = json.loads(request.args.get('latlng'))
    latlng['lat'] = float(latlng['lat'])
    latlng['lng'] = float(latlng['lng'])
    select = json.loads(request.args.get('select'))
    hasil = datasets.getLayerOrPoint(
        id=id, key=key, select=select, latlng=latlng).to_dict()
    return jsonify(hasil)


@app.route('/api/getlayerheadercropped')
def getlayerheadercropped():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    select = json.loads(request.args.get('select'))
    bounds = json.loads(request.args.get('bounds'))
    hasil = datasets.getLayerHeaderCropped(
        id=id, key=key, select=select, bounds=bounds)
    return jsonify(hasil)


@app.route('/api/getlayercropped')
def getlayercropped():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    select = json.loads(request.args.get('select'))
    bounds = json.loads(request.args.get('bounds'))
    hasil = plot.toPngResponse(datasets.getLayerCropped(
        id=id, key=key, select=select, bounds=bounds))
    return send_file(hasil, mimetype='image/png')


@app.route('/api/getdatapointminormax')
def getdatapointminormax():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    minormax = request.args.get('minormax')
    select = json.loads(request.args.get('select'))
    hasil = datasets.getDataPointMinOrMax(
        id=id, key=key, minormax=minormax, select=select)
    return jsonify(hasil)


@app.route('/api/getlayerheaderanomali')
def getlayerheaderanomali():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    select = json.loads(request.args.get('select'))
    projection = request.args.get('projection')
    hasil = datasets.getLayerHeaderAnomali(
        id=id, key=key, select=select, projection=projection)
    return jsonify(hasil)


@app.route('/api/getlayeranomali')
def getlayeranomali():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    select = json.loads(request.args.get('select'))
    projection = request.args.get('projection')
    hasil = plot.toPngResponse(
        datasets.getLayerOrPointAnomali(id=id, key=key, select=select, projection=projection))
    return send_file(hasil, mimetype='image/png')


@app.route('/api/getdatapointanomali')
def getdatapointanomali():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    latlng = json.loads(request.args.get('latlng'))
    latlng['lat'] = float(latlng['lat'])
    latlng['lng'] = float(latlng['lng'])
    select = json.loads(request.args.get('select'))
    projection = request.args.get('projection')
    hasil = datasets.getLayerOrPointAnomali(
        id=id, key=key, select=select, latlng=latlng, projection=projection).to_dict()
    return jsonify(hasil)


@app.route('/api/getdatapointtimeseriesanomali')
def getdatapointtimeseriesanomali():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    latlng = json.loads(request.args.get('latlng'))
    latlng['lat'] = float(latlng['lat'])
    latlng['lng'] = float(latlng['lng'])
    select = json.loads(request.args.get('select'))
    projection = request.args.get('projection')
    hasil = datasets.getDataPointTimeSeriesAnomali(
        id=id, key=key, select=select, latlng=latlng, projection=projection).to_dict()
    return jsonify(hasil)


app.run(host='0.0.0.0', port=8080, debug=True)
