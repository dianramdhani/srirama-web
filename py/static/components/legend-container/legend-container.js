angular.module('srirama')
    .component('legendContainer', {
        bindings: {
            footers: '=',
            legend: '<'
        },
        controller: [class legendContainer {
            $onChanges(e) {
                if (e.legend) {
                    if (e.legend.currentValue) {
                        var bg = '#AAD3DF';
                        var op = 0.7;
                        var paletteDir = './img/legend.png';
                        var legendText = this.legend.legendText;
                        var unit = this.legend.unit;
                        legend('legend', legendText, bg, op, paletteDir, unit);

                        /**
                         * Pembuatan Legend.
                         * 
                         * @param  {String} strId - Id dari tag div di html.
                         * @param  {Array1D} arrLegend - Array legend yang diambil dari header data.
                         * @param  {String} strBackgroundColor - Warna background legend (samakan dengan warna dasar map).
                         *      Ex: 'gray'/'#FFFFFF'
                         * @param  {float} opacity - Nilai transparan dari legend. Samakan dengan opacity image overlay map.
                         * @param  {String} dirPalette - Directory tempat gambar 1*100px disimpan untuk dijadikan palette.
                         * @param  {String} strUnit - Besaran yang akan ditampilkan di legend.
                         */
                        function legend(strId, arrLegend, strBackgroundColor, opacity, dirPalette, strUnit) {
                            var legendContainer = document.createElement('div');
                            legendContainer.style.cssText = 'height: 100%; width: 100%; overflow: hidden;';
                            legendContainer.style.backgroundColor = strBackgroundColor;
                            var leftDiv = document.createElement('div');
                            leftDiv.style.cssText = 'position: absolute; top: 0; left: 0; height: 100%; width: 50%; background-color: #0B5BDF;';
                            leftDiv.style.opacity = opacity;
                            var rightDiv = document.createElement('div');
                            rightDiv.style.cssText = 'position: absolute; top: 0; left: 50%; height: 100%; width: 50%; background-color: #B4319C;';
                            rightDiv.style.opacity = opacity;
                            var paletteDiv = document.createElement('div');
                            paletteDiv.style.cssText = 'position: absolute; top: 0; left: 58.3%; transform: translate(-50%, 0); width: 70%; height: 100%;';
                            paletteDiv.style.backgroundColor = strBackgroundColor;
                            var paletteImg = document.createElement('img');
                            paletteImg.style.cssText = 'width: 100%; height: 100%;';
                            paletteImg.style.opacity = opacity;
                            paletteImg.src = dirPalette;
                            paletteDiv.appendChild(paletteImg);
                            for (var i in arrLegend) {
                                var pLegend = document.createElement('p');
                                pLegend.style.cssText = 'position: absolute; top: 0; transform: translate(-50%, -50%); white-space: nowrap; overflow: hidden; max-width: 19%; color: white;';
                                pLegend.style.left = ((i / (arrLegend.length - 1)) * 100).toString() + '%';
                                pLegend.textContent = arrLegend[i] < 0.01 ? arrLegend[i].toExponential(2).toString() : arrLegend[i].toFixed(2).toString();
                                paletteDiv.appendChild(pLegend);
                            }
                            var pUnit = document.createElement('p');
                            pUnit.style.cssText = 'position: absolute; top: 0; left: 3%; transform: translate(0, -50%); color: white; white-space: nowrap; overflow: hidden; max-width: 35%;';
                            pUnit.textContent = strUnit;
                            legendContainer.appendChild(leftDiv);
                            legendContainer.appendChild(rightDiv);
                            legendContainer.appendChild(pUnit);
                            legendContainer.appendChild(paletteDiv);
                            var divContainer = document.getElementById(strId);
                            divContainer.setAttribute('style', 'height: 22px; width: 100%;');
                            while (divContainer.firstChild) {
                                divContainer.removeChild(divContainer.firstChild);
                            }
                            divContainer.appendChild(legendContainer);
                        }
                    }
                }
            }
        }],
        template: require('./legend-container.html')
    })