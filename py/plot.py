from PIL import Image
from io import BytesIO
from numpy import array, nanmin, nanmax, interp, zeros, uint8, flipud, isnan
from os.path import dirname

# rgba untuk antisipasi nan
try:
    legend = array(
        Image.open(dirname(__file__) + '/../app/img/legend.png').convert(
            'RGBA'))[0]
except IOError:
    legend = array(
        Image.open(dirname(__file__) + '/../../app/img/legend.png').convert(
            'RGBA'))[0]


def toImage(data):
    # lat/y untuk flip
    lat = data[data.dims[0]]

    data = data.data
    max = nanmax(data)
    min = nanmin(data)
    _image = zeros([len(data), len(data[0]), 4], dtype=uint8)
    _y = 0
    for y in data:
        _x = 0
        for x in y:
            global legend
            if isnan(x):
                _image[_y][_x] = [0, 0, 0, 0]
            else:
                x = int(interp(x, [min, max], [0, 99]))
                _image[_y][_x] = legend[x]
            _x += 1
        _y += 1

    if lat[0] < lat[-1]:
        _image = flipud(_image)
    return _image


def toPngResponse(data):
    res = BytesIO()
    Image.fromarray(toImage(data)).save(res, format='PNG')
    res.seek(0)
    return res
