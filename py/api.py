import xarray


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

    """
    getDataPointTimeSeries
    parameter
    select = {'time': [<time 1>, <time 2>]}
    """

    def getDataPointTimeSeries(self, id, key, select, lat, lon):
        for dataset in Datasets.__datasets:
            if dataset['id'] == id:
                datasel = dataset['dataset'][key]
                # select lat
                dimsLatName = datasel.dims[-2]
                select[dimsLatName] = lat
                # select lon
                dimsLonName = datasel.dims[-1]
                select[dimsLonName] = lon
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


datasets = Datasets()

from flask import Flask, request, jsonify, send_file, json
from flask_cors import CORS

app = Flask(__name__, static_url_path="", static_folder="static")
CORS(app, resources=r'/api/*')


@app.route('/')
def index():
    return app.send_static_file('index.html')


"""
/getdatapointtimeseries
dashboard-container
"""


@app.route('/api/getdatapointtimeseries')
def getdatapointtimeseries():
    id = int(request.args.get('id'))
    key = request.args.get('key')
    lat = float(request.args.get('lat'))
    lon = float(request.args.get('lon'))
    select = json.loads(request.args.get('select'))
    hasil = datasets.getDataPointTimeSeries(
        id=id, key=key, select=select, lat=lat, lon=lon).to_dict()
    return jsonify(hasil)


"""
/getdatasets
dashboard-container
"""


@app.route('/api/getdatasets')
def getdatasets():
    hasil = datasets.getDatasets()
    return jsonify(hasil)


app.run(host='0.0.0.0', port=4343, debug=True)
