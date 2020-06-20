var floatMenu;
var tfn;

function initPage() {
    var start = 'left';
    var rform = document.forms['xdoRptForm'];
    var splitpane = new SplitXPane("leftcol", 33.3, "contentcol", 33.33, 66.7, 200, {resizeObjects: ['showheaderlink', 'hideheaderlink']});
    SplitXPane.setAll();
    docTabs = new FrameTabs({
        containerId: "tabs",
        frameContainerId: "cpane",
        frameIdPrefix: "xdo:docframe",
        disableDelete: true,
        tabClickFunction: onClickLayoutTab,
        dir: "left",
        frameOnLoadFunction: hideProcessMessage
    });
    docTabs.addUIObj('reportViewLink');
    docTabs.addUIObj('reportParamLink');
    docTabs.addUIObj('|');
    docTabs.addUIObj('xdo:viewFormatLink');
    docTabs.addUIObj('reportViewMenu');
    docTabs.addUIObj('|');
    docTabs.addUIObj('xdo:reportViewHelp');
    docTabs.addTab('Agricultură - silvicultură - mediu - cu grafice');
    docTabs.addTab('Agricultură - silvicultură - mediu - fără grafice');
    docTabs.selectTab(0);
    docTabs.drawTabs();
    var reportPath = document.forms['xdoRptForm'] ? document.forms['xdoRptForm']._xdo.value : false;
    if (reportPath && reportPath.length > 0 && reportPath.lastIndexOf('/') > 0) {
        var fpath = reportPath.substring(0, reportPath.lastIndexOf('/'));
        writeSessionCookie('ORA_XDO_CATALOG_lastopenfolder', fpath);
    }
    var srh_paramsP_AN_REF = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_AN_REF_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_AN_REF';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_AN_REF_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_AN_REF_div_input',
                paramPrompt: '1. An referinta:',
                multiSelect: true,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new MultiChoiceList('xdo:_paramsP_AN_REF_div', '_paramsP_AN_REF', [['2020', '31'], ['2019', '30'], ['2018', '29'], ['2017', '28'], ['2016', '27'], ['2015', '26'], ['2014', '25'], ['2013', '24'], ['2012', '23'], ['2011', '22'], ['2010', '21'], ['2009', '20'], ['2008', '19'], ['2007', '18'], ['2006', '17'], ['2005', '16'], ['2004', '15'], ['2003', '14'], ['2002', '13'], ['2001', '12'], ['2000', '11'], ['1999', '10'], ['1998', '9'], ['1997', '8'], ['1996', '7'], ['1995', '6'], ['1994', '5'], ['1993', '4'], ['1992', '3'], ['1991', '2'], ['1990', '1']], false, '/xmlpserver', false, false, true, false, srh_paramsP_AN_REF);

    var srh_paramsP_INDIC = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_INDIC_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_INDIC';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_INDIC_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_INDIC_div_input',
                paramPrompt: '2. Indicatori:',
                multiSelect: false,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new SingleChoiceList({
        id: 'xdo:_paramsP_INDIC_div',
        pName: '_paramsP_INDIC',
        selectedOption: ['AGR101B - Suprafaţa fondului funciar după modul de folosinţă, pe forme de proprietate', '1'],
        changeHandler: onParameterChange,
        searchFunction: srh_paramsP_INDIC,
        options: [['AGR101B - Suprafaţa fondului funciar după modul de folosinţă, pe forme de proprietate', '1'], ['AGR108B - Suprafata cultivata cu principalele culturi', '2'], ['AGR109B - Productia agricola vegetala la principalele culturi', '3'], ['AGR112B - Productia totala de struguri', '4'], ['AGR115B - Productia de fructe', '5'], ['AGR201B - Efectivele de animale, pe principalele categorii de animale, forme de proprietate, la sfarsitul anului', '6'], ['AGR202B - Productia agricola animala', '7'], ['PPA101A - Preturile medii anuale ale produselor agricole vandute in pietele agroalimentare', '2004'], ['WEB10 - Cantitatea valorificata de deseuri menajere si asimilabile (Kilograme)', '85'], ['WEB6 - Cantitatea colectată  de deşeuri menajere şi asimilabile (Kilograme)', '81'], ['WEB8 - Cheltuieli curente din bugetul local pentru protecţia mediului (Lei)', '83'], ['WEB9 - Investiţii din bugetul local pentru protecţia mediului (Lei)', '84']]
    });

    var srh_paramsP_DEZAGREGARE1 = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_DEZAGREGARE1_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_DEZAGREGARE1';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                var dependentParams = new Array();
                dependentParams['_paramsP_INDIC'] = 1;
                var dependentValues = getParameterValues(dependentParams);
                if (dependentValues && dependentValues.length > 0) {
                    url += (dependentValues.charAt[0] == '&') ? dependentValues : '&' + dependentValues;
                }
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_DEZAGREGARE1_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_DEZAGREGARE1_div_input',
                paramPrompt: '3. Dezagregare 1:',
                multiSelect: false,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new SingleChoiceList({
        id: 'xdo:_paramsP_DEZAGREGARE1_div',
        pName: '_paramsP_DEZAGREGARE1',
        selectedOption: ['Mod de folosinta pentru suprafata agricola', '21'],
        changeHandler: onParameterChange,
        searchFunction: srh_paramsP_DEZAGREGARE1,
        options: [['Mod de folosinta pentru suprafata agricola', '21']]
    });

    var srh_paramsP_DEZAGREGARE2 = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_DEZAGREGARE2_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_DEZAGREGARE2';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                var dependentParams = new Array();
                dependentParams['_paramsP_INDIC'] = 1;
                var dependentValues = getParameterValues(dependentParams);
                if (dependentValues && dependentValues.length > 0) {
                    url += (dependentValues.charAt[0] == '&') ? dependentValues : '&' + dependentValues;
                }
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_DEZAGREGARE2_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_DEZAGREGARE2_div_input',
                paramPrompt: '4. Dezagregare 2:',
                multiSelect: false,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new SingleChoiceList({
        id: 'xdo:_paramsP_DEZAGREGARE2_div',
        pName: '_paramsP_DEZAGREGARE2',
        selectedOption: ['Forme de proprietate', '2'],
        changeHandler: onParameterChange,
        searchFunction: srh_paramsP_DEZAGREGARE2,
        options: [['Forme de proprietate', '2']]
    });

    var srh_paramsP_CRITERIU1 = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_CRITERIU1_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_CRITERIU1';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                var dependentParams = new Array();
                dependentParams['_paramsP_INDIC'] = 1;
                dependentParams['_paramsP_DEZAGREGARE1'] = 1;
                var dependentValues = getParameterValues(dependentParams);
                if (dependentValues && dependentValues.length > 0) {
                    url += (dependentValues.charAt[0] == '&') ? dependentValues : '&' + dependentValues;
                }
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_CRITERIU1_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_CRITERIU1_div_input',
                paramPrompt: '5. Criteriu 1:',
                multiSelect: true,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new MultiChoiceList('xdo:_paramsP_CRITERIU1_div', '_paramsP_CRITERIU1', [['Total', '0'], ['Agricola', '10'], ['Arabila', '11'], ['Pasuni', '12'], ['Finete', '13'], ['Vii si pepiniere viticole', '14'], ['Livezi si pepiniere pomicole', '15'], ['Terenuri neagricole total', '19'], ['Paduri si alta vegetatie forestiera', '20'], ['Ocupata cu ape, balti', '30'], ['Ocupata cu constructii', '50'], ['Cai de comunicatii si cai ferate', '60'], ['Terenuri degradate si neproductive', '70']], false, '/xmlpserver', false, false, true, false, srh_paramsP_CRITERIU1);

    var srh_paramsP_CRITERIU2 = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_CRITERIU2_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_CRITERIU2';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                var dependentParams = new Array();
                dependentParams['_paramsP_INDIC'] = 1;
                dependentParams['_paramsP_DEZAGREGARE2'] = 1;
                var dependentValues = getParameterValues(dependentParams);
                if (dependentValues && dependentValues.length > 0) {
                    url += (dependentValues.charAt[0] == '&') ? dependentValues : '&' + dependentValues;
                }
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_CRITERIU2_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_CRITERIU2_div_input',
                paramPrompt: '6. Criteriu 2:',
                multiSelect: true,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new MultiChoiceList('xdo:_paramsP_CRITERIU2_div', '_paramsP_CRITERIU2', [['Total', '0'], ['Proprietate privata', '29']], false, '/xmlpserver', false, false, true, false, srh_paramsP_CRITERIU2);

    var srh_paramsP_MACROREG = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_MACROREG_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_MACROREG';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_MACROREG_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_MACROREG_div_input',
                paramPrompt: '7. Macroregiune:',
                multiSelect: true,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new MultiChoiceList('xdo:_paramsP_MACROREG_div', '_paramsP_MACROREG', [['Macroregiunea 1', '1'], ['Macroregiunea 2', '2'], ['Macroregiunea 3', '3'], ['Macroregiunea 4', '4']], [['All', '*']], '/xmlpserver', false, onParameterChange, true, false, srh_paramsP_MACROREG);

    var srh_paramsP_NREG = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_NREG_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_NREG';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_NREG_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_NREG_div_input',
                paramPrompt: '8. Nivel regiune',
                multiSelect: false,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new SingleChoiceList({
        id: 'xdo:_paramsP_NREG_div',
        pName: '_paramsP_NREG',
        selectedOption: ['Da', 'Da'],
        changeHandler: onParameterChange,
        searchFunction: srh_paramsP_NREG,
        options: [['Da', 'Da'], ['Nu', 'Nu']]
    });

    var srh_paramsP_REG = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_REG_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_REG';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                var dependentParams = new Array();
                dependentParams['_paramsP_MACROREG'] = 1;
                dependentParams['_paramsP_NREG'] = 1;
                var dependentValues = getParameterValues(dependentParams);
                if (dependentValues && dependentValues.length > 0) {
                    url += (dependentValues.charAt[0] == '&') ? dependentValues : '&' + dependentValues;
                }
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_REG_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_REG_div_input',
                paramPrompt: '9. Regiune:',
                multiSelect: true,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new MultiChoiceList('xdo:_paramsP_REG_div', '_paramsP_REG', [['NORD-EST', '1'], ['SUD-EST', '2'], ['SUD MUNTENIA', '3'], ['SUD-VEST OLTENIA', '4'], ['VEST', '5'], ['NORD-VEST', '6'], ['CENTRU', '7'], ['BUCURESTI', '8']], [['All', '*']], '/xmlpserver', false, onParameterChange, true, false, srh_paramsP_REG);

    var srh_paramsP_NJUD = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_NJUD_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_NJUD';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                var dependentParams = new Array();
                dependentParams['_paramsP_NREG'] = 1;
                var dependentValues = getParameterValues(dependentParams);
                if (dependentValues && dependentValues.length > 0) {
                    url += (dependentValues.charAt[0] == '&') ? dependentValues : '&' + dependentValues;
                }
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_NJUD_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_NJUD_div_input',
                paramPrompt: '10. Nivel judeţ',
                multiSelect: false,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new SingleChoiceList({
        id: 'xdo:_paramsP_NJUD_div',
        pName: '_paramsP_NJUD',
        selectedOption: ['Da', 'Da'],
        changeHandler: onParameterChange,
        searchFunction: srh_paramsP_NJUD,
        options: [['Da', 'Da'], ['Nu', 'Nu']]
    });

    var srh_paramsP_JUD = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_JUD_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_JUD';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                var dependentParams = new Array();
                dependentParams['_paramsP_REG'] = 1;
                dependentParams['_paramsP_NJUD'] = 1;
                var dependentValues = getParameterValues(dependentParams);
                if (dependentValues && dependentValues.length > 0) {
                    url += (dependentValues.charAt[0] == '&') ? dependentValues : '&' + dependentValues;
                }
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_JUD_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_JUD_div_input',
                paramPrompt: '11. Judet:',
                multiSelect: true,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new MultiChoiceList('xdo:_paramsP_JUD_div', '_paramsP_JUD', [['ALBA', '1'], ['ARAD', '2'], ['ARGES', '3'], ['BACAU', '4'], ['BIHOR', '5'], ['BISTRITA-NASAUD', '6'], ['BOTOSANI', '7'], ['BRASOV', '8'], ['BRAILA', '9'], ['BUZAU', '10'], ['CARAS-SEVERIN', '11'], ['CALARASI', '51'], ['CLUJ', '12'], ['CONSTANTA', '13'], ['COVASNA', '14'], ['DAMBOVITA', '15'], ['DOLJ', '16'], ['GALATI', '17'], ['GIURGIU', '52'], ['GORJ', '18'], ['HARGHITA', '19'], ['HUNEDOARA', '20'], ['IALOMITA', '21'], ['IASI', '22'], ['ILFOV', '23'], ['MARAMURES', '24'], ['MEHEDINTI', '25'], ['MURES', '26'], ['NEAMT', '27'], ['OLT', '28'], ['PRAHOVA', '29'], ['SATU MARE', '30'], ['SALAJ', '31'], ['SIBIU', '32'], ['SUCEAVA', '33'], ['TELEORMAN', '34'], ['TIMIS', '35'], ['TULCEA', '36'], ['VASLUI', '37'], ['VALCEA', '38'], ['VRANCEA', '39'], ['BUCURESTI', '40']], [['All', '*']], '/xmlpserver', false, onParameterChange, true, false, srh_paramsP_JUD);

    var srh_paramsP_NMOC = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_NMOC_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_NMOC';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                var dependentParams = new Array();
                dependentParams['_paramsP_NJUD'] = 1;
                var dependentValues = getParameterValues(dependentParams);
                if (dependentValues && dependentValues.length > 0) {
                    url += (dependentValues.charAt[0] == '&') ? dependentValues : '&' + dependentValues;
                }
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_NMOC_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_NMOC_div_input',
                paramPrompt: '12. Nivel localitate',
                multiSelect: false,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new SingleChoiceList({
        id: 'xdo:_paramsP_NMOC_div',
        pName: '_paramsP_NMOC',
        selectedOption: ['Selectie detaliata localitati', 'Da'],
        changeHandler: onParameterChange,
        searchFunction: srh_paramsP_NMOC,
        options: [['Selectie detaliata localitati', 'Da'], ['Toate localitatile', 'Toate'], ['Fara nivel localitate', 'Nu']]
    });

    var srh_paramsP_MOC = function (list) {
        var dialogLovSearch = SearchDialog.getMember('xdo:xdo:_paramsP_MOC_div_input');
        if (dialogLovSearch == null) {
            var lovSearchUrl = function (searchValue, searchOption, matchCase, event, multiSelect) {
                var parameterName = 'P_MOC';
                var url = xdo.constants.CONTEXT_PATH + '/lovParam.jsp?' + '_xdo=' + encodeURIComponent('/PODCA/Reports/Agricultură - silvicultură - mediu.xdo') + '&paramValue=' + searchValue + '&paramName=' + parameterName + '&searchOption=' + searchOption + '&matchCase=' + matchCase + '&multiSelect=' + multiSelect;
                var dependentParams = new Array();
                dependentParams['_paramsP_JUD'] = 1;
                dependentParams['_paramsP_NMOC'] = 1;
                var dependentValues = getParameterValues(dependentParams);
                if (dependentValues && dependentValues.length > 0) {
                    url += (dependentValues.charAt[0] == '&') ? dependentValues : '&' + dependentValues;
                }
                return url;
            };
            dialogLovSearch = SearchDialog.init({
                id: 'xdo:xdo:_paramsP_MOC_div_input',
                searchUrl: lovSearchUrl,
                reportPath: '/PODCA/Reports/Agricultură - silvicultură - mediu.xdo',
                paramName: 'xdo:xdo:_paramsP_MOC_div_input',
                paramPrompt: '13. Localitate:',
                multiSelect: true,
                closeAction: function (a, b) {
                    list.setSelection(a, b);
                    return false;
                },
                displayDelimiter: ';'
            });
        }
        if (dialogLovSearch) {
            dialogLovSearch.draw();
        }
        return false;
    };
    new MultiChoiceList('xdo:_paramsP_MOC_div', '_paramsP_MOC', [['MUNICIPIUL ALBA IULIA', '1017'], ['MUNICIPIUL AIUD', '1213'], ['MUNICIPIUL BLAJ', '1348'], ['MUNICIPIUL SEBES', '1874'], ['ORAS ABRUD', '1151'], ['ORAS BAIA DE ARIES', '2915'], ['ORAS CAMPENI', '1455'], ['ORAS CUGIR', '1696'], ['ORAS OCNA MURES', '1794'], ['ORAS TEIUS', '8096'], ['ORAS ZLATNA', '1936'], ['ALBAC', '2130'], ['ALMASU MARE', '2309'], ['ARIESENI', '2381'], ['AVRAM IANCU', '2577'], ['BERGHIN', '2988'], ['BISTRA', '3039'], ['BLANDIANA', '3397'], ['BUCERDEA GRANOASA', '9026'], ['BUCIUM', '3459'], ['CALNIC', '4106'], ['CENADE', '3761'], ['CERGAU', '3805'], ['CERU-BACAINTI', '3841'], ['CETATEA DE BALTA', '3958'], ['CIUGUD', '1071'], ['CIURULEASA', '4008'], ['CRACIUNELU DE JOS', '4188'], ['CRICAU', '4142'], ['CUT', '9019'], ['DAIA ROMANA', '4240'], ['DOSTAT', '4268'], ['FARAU', '4302'], ['GALDA DE JOS', '4366'], ['GARBOVA', '4482'], ['GARDA DE SUS', '4525'], ['HOPARTA', '4703'], ['HOREA', '4767'], ['IGHIU', '4927'], ['INTREGALDE', '4981'], ['JIDVEI', '5103'], ['LIVEZILE', '5167'], ['LOPADEA NOUA', '5210'], ['LUNCA MURESULUI', '5309'], ['LUPSA', '5336'], ['METES', '5577'], ['MIHALT', '5700'], ['MIRASLAU', '5755'], ['MOGOS', '5826'], ['NOSLAC', '6048'], ['OCOLIS', '6119'], ['OHABA', '6164'], ['PIANU', '6217'], ['POIANA VADULUI', '6271'], ['PONOR', '6397'], ['POSAGA', '6468'], ['RADESTI', '6547'], ['RAMET', '6627'], ['RAMETEA', '6592'], ['ROSIA DE SECAS', '6930'], ['ROSIA MONTANA', '6761'], ['SALCIUA', '6976'], ['SALISTEA', '7044'], ['SANCEL', '7348'], ['SANTIMBRU', '7384'], ['SASCIORI', '7099'], ['SCARISOARA', '7197'], ['SIBOT', '7810'], ['SOHODOL', '7446'], ['SONA', '7865'], ['SPRING', '7945'], ['STREMT', '7767'], ['SUGAG', '8014'], ['UNIREA', '8158'], ['VADU MOTILOR', '8229'], ['VALEA LUNGA', '8354'], ['VIDRA', '8425'], ['VINTU DE JOS', '8826'], ['MUNICIPIUL ARAD', '9262'], ['ORAS CHISINEU-CRIS', '9459'], ['ORAS CURTICI', '9495'], ['ORAS INEU', '9538'], ['ORAS LIPOVA', '9574'], ['ORAS NADLAC', '9627'], ['ORAS PANCOTA', '9654'], ['ORAS PECICA', '11584'], ['ORAS SANTANA', '12091'], ['ORAS SEBIS', '9690'], ['ALMAS', '9743'], ['APATEU', '9798'], ['ARCHIS', '9832'], ['BARSA', '10051'], ['BARZAVA', '10104'], ['BATA', '9887'], ['BELIU', '9930'], ['BIRCHIS', '10006'], ['BOCSIG', '10195'], ['BRAZII', '10239'], ['BUTENI', '10293'], ['CARAND', '10346'], ['CERMEI', '10373'], ['CHISINDIA', '10417'], ['CONOP', '10453'], ['COVASINT', '10514'], ['CRAIVA', '10532'], ['DEZNA', '10649'], ['DIECI', '10701'], ['DOROBANTI', '12912'], ['FANTANELE', '9280'], ['FELNAC', '10827'], ['FRUMUSENI', '12920'], ['GHIOROC', '10872'], ['GRANICERI', '10916'], ['GURAHONT', '10943'], ['HALMAGEL', '11174'], ['HALMAGIU', '11058'], ['HASMAS', '11236'], ['IGNESTI', '11307'], ['IRATOSU', '11352'], ['LIVADA', '9333'], ['MACEA', '11398'], ['MISCA', '11423'], ['MONEASA', '11478'], ['OLARI', '11502'], ['PAULIS', '11539'], ['PEREGU MARE', '11637'], ['PETRIS', '11664'], ['PILU', '11735'], ['PLESCUTA', '11762'], ['SAGU', '12144'], ['SAVARSIN', '11842'], ['SECUSIGIU', '11940'], ['SEITIN', '12206'], ['SELEUS', '11995'], ['SEMLAC', '12037'], ['SEPREUS', '12224'], ['SICULA', '12242'], ['SILINDIA', '12288'], ['SIMAND', '12340'], ['SINTEA MARE', '12055'], ['SIRIA', '12368'], ['SISTAROVAT', '12402'], ['SOCODOR', '12126'], ['SOFRONEA', '9360'], ['TARNOVA', '12509'], ['TAUT', '12457'], ['USUSAU', '10765'], ['VARADIA DE MURES', '12572'], ['VARFURILE', '12689'], ['VINGA', '12643'], ['VLADIMIRESCU', '9397'], ['ZABRANI', '12778'], ['ZADARENI', '12938'], ['ZARAND', '12812'], ['ZERIND', '12849'], ['ZIMANDU NOU', '12876'], ['MUNICIPIUL PITESTI', '13169'], ['MUNICIPIUL CAMPULUNG', '13490'], ['MUNICIPIUL CURTEA DE ARGES', '13622'], ['ORAS COSTESTI', '13668'], ['ORAS MIOVENI', '13301'], ['ORAS STEFANESTI', '13392'], ['ORAS TOPOLOVENI', '13757'], ['ALBESTII DE ARGES', '13819'], ['ALBESTII DE MUSCEL', '13891'], ['ALBOTA', '13935'], ['ANINOASA', '13999'], ['AREFU', '14049'], ['BABANA', '14085'], ['BAICULESTI', '14165'], ['BALILESTI', '14272'], ['BARLA', '14450'], ['BASCOV', '13187'], ['BELETI-NEGRESTI', '14352'], ['BEREVOESTI', '14405'], ['BOGATI', '14584'], ['BOTENI', '14673'], ['BOTESTI', '14726'], ['BRADU', '13276'], ['BRADULET', '14753'], ['BUDEASA', '14851'], ['BUGHEA DE JOS', '14922'], ['BUGHEA DE SUS', '20063'], ['BUZOESTI', '14940'], ['CALDARARU', '15064'], ['CALINESTI', '15108'], ['CATEASCA', '15233'], ['CEPARI', '15313'], ['CETATENI', '15402'], ['CICANESTI', '15448'], ['CIOFRANGENI', '15493'], ['CIOMAGESTI', '15554'], ['COCU', '15652'], ['CORBENI', '15741'], ['CORBI', '15830'], ['COSESTI', '15901'], ['COTMEANA', '15983'], ['CUCA', '16132'], ['DAMBOVICIOARA', '16329'], ['DARMANESTI', '16365'], ['DAVIDESTI', '16285'], ['DOBRESTI', '16427'], ['DOMNESTI', '16454'], ['DRAGANU', '16506'], ['DRAGOSLAVELE', '16472'], ['GODENI', '16551'], ['HARSESTI', '16613'], ['HARTIESTI', '16659'], ['IZVORU', '16739'], ['LEORDENI', '16757'], ['LERESTI', '16908'], ['LUNCA CORBULUI', '16944'], ['MALURENI', '17049'], ['MARACINENI', '13365'], ['MERISANI', '17101'], ['MICESTI', '17209'], ['MIHAESTI', '17254'], ['MIOARELE', '17334'], ['MIROSI', '17398'], ['MORARESTI', '17423'], ['MOSOAIA', '17496'], ['MOZACENI', '17575'], ['MUSATESTI', '17619'], ['NEGRASI', '17726'], ['NUCSOARA', '17771'], ['OARJA', '17824'], ['PIETROSANI', '17851'], ['POIANA LACULUI', '18028'], ['POIENARII DE ARGES', '17913'], ['POIENARII DE MUSCEL', '17968'], ['POPESTI', '18162'], ['PRIBOIENI', '18242'], ['RACA', '20048'], ['RATESTI', '18331'], ['RECEA', '18411'], ['ROCIU', '18475'], ['RUCAR', '18527'], ['SALATRUCU', '18554'], ['SAPATA', '18581'], ['SCHITU GOLESTI', '18670'], ['SLOBOZIA', '18741'], ['STALPENI', '18778'], ['STEFAN CEL MARE', '19114'], ['STOENESTI', '18858'], ['STOLNICI', '18938'], ['SUICI', '19141'], ['SUSENI', '19007'], ['TEIU', '19212'], ['TIGVENI', '19249'], ['TITESTI', '19338'], ['UDA', '19392'], ['UNGHENI', '19560'], ['VALEA DANULUI', '19631'], ['VALEA IASULUI', '19695'], ['VALEA MARE PRAVAT', '13524'], ['VEDEA', '19793'], ['VLADESTI', '19999'], ['VULTURESTI', '20055'], ['MUNICIPIUL BACAU', '20297'], ['MUNICIPIUL MOINESTI', '20876'], ['MUNICIPIUL ONESTI', '20563'], ['ORAS BUHUSI', '20778'], ['ORAS COMANESTI', '20821'], ['ORAS DARMANESTI', '22166'], ['ORAS SLANIC-MOLDOVA', '20910'], ['ORAS TARGU OCNA', '20965'], ['AGAS', '21007'], ['ARDEOANI', '21098'], ['ASAU', '21123'], ['BALCANI', '21196'], ['BARSANESTI', '21454'], ['BERESTI-BISTRITA', '21249'], ['BERESTI-TAZLAU', '21338'], ['BERZUNTI', '21418'], ['BLAGESTI', '21506'], ['BOGDANESTI', '21560'], ['BRUSTUROASA', '21597'], ['BUCIUMI', '26338'], ['BUHOCI', '21668'], ['CAIUTI', '21757'], ['CASIN', '21720'], ['CLEJA', '21855'], ['COLONESTI', '21891'], ['CORBASCA', '21971'], ['COTOFANESTI', '22059'], ['DAMIENESTI', '22111'], ['DEALU MORII', '22237'], ['DOFTEANA', '22380'], ['FARAOANI', '22460'], ['FILIPENI', '22488'], ['FILIPESTI', '22576'], ['GAICEANA', '22665'], ['GARLENI', '22781'], ['GHIMES-FAGET', '22718'], ['GIOSENI', '26346'], ['GLAVANESTI', '22834'], ['GURA VAII', '20607'], ['HELEGIU', '22898'], ['HEMEIUS', '20313'], ['HORGESTI', '22941'], ['HURUIESTI', '23047'], ['ITESTI', '26379'], ['IZVORU BERHECIULUI', '23127'], ['LETEA VECHE', '20359'], ['LIPOVA', '23207'], ['LIVEZI', '23289'], ['LUIZI-CALUGARA', '23350'], ['MAGIRESTI', '23387'], ['MAGURA', '20411'], ['MANASTIREA CASIN', '23449'], ['MARGINENI', '20466'], ['MOTOSENI', '23494'], ['NEGRI', '23644'], ['NICOLAE BALCESCU', '23715'], ['ODOBESTI', '26353'], ['OITUZ', '23797'], ['ONCESTI', '23868'], ['ORBENI', '23948'], ['PALANCA', '23975'], ['PANCESTI', '24187'], ['PARAVA', '24034'], ['PARGARESTI', '24276'], ['PARINCEA', '24089'], ['PARJOL', '24338'], ['PLOPANA', '24427'], ['PODU TURCULUI', '24524'], ['PODURI', '24631'], ['PRAJESTI', '26361'], ['RACACIUNI', '24766'], ['RACHITOASA', '24837'], ['RACOVA', '24711'], ['ROSIORI', '24999'], ['SANDULENI', '25148'], ['SARATA', '26320'], ['SASCUT', '25068'], ['SAUCESTI', '25228'], ['SCORTENI', '25291'], ['SECUIENI', '25362'], ['SOLONT', '25488'], ['STANISESTI', '25521'], ['STEFAN CEL MARE', '20670'], ['STRUGARI', '25629'], ['TAMASI', '25692'], ['TARGU TROTUS', '25825'], ['TATARASTI', '25745'], ['TRAIAN', '25861'], ['UNGURENI', '25932'], ['URECHESTI', '26029'], ['VALEA SEACA', '26083'], ['VULTURENI', '26118'], ['ZEMES', '26289'], ['MUNICIPIUL ORADEA', '26564'], ['MUNICIPIUL BEIUS', '26804'], ['MUNICIPIUL MARGHITA', '26877'], ['MUNICIPIUL SALONTA', '26975'], ['ORAS ALESD', '26699'], ['ORAS NUCET', '26920'], ['ORAS SACUENI', '30915'], ['ORAS STEI', '26840'], ['ORAS VALEA LUI MIHAI', '32027'], ['ORAS VASCAU', '27007'], ['ABRAM', '27070'], ['ABRAMUT', '27169'], ['ASTILEU', '26742'], ['AUSEU', '27212'], ['AVRAM IANCU', '27285'], ['BALC', '27329'], ['BATAR', '27383'], ['BIHARIA', '27436'], ['BOIANU MARE', '27506'], ['BOROD', '27560'], ['BORS', '27631'], ['BRATCA', '27686'], ['BRUSTURI', '27757'], ['BUDUREASA', '27846'], ['BUDUSLAU', '27908'], ['BULZ', '27935'], ['BUNTESTI', '27971'], ['CABESTI', '28077'], ['CAMPANI', '28709'], ['CAPALNA', '28139'], ['CARPINET', '28193'], ['CEFA', '28246'], ['CEICA', '28335'], ['CETARIU', '28415'], ['CHERECHIU', '28497'], ['CHISLAZ', '28530'], ['CIUMEGHIU', '28665'], ['COCIUBA MARE', '28763'], ['COPACEL', '28816'], ['CRISTIORU DE JOS', '28889'], ['CURATELE', '28941'], ['CURTUISENI', '29001'], ['DERNA', '29038'], ['DIOSIG', '29092'], ['DOBRESTI', '29154'], ['DRAGANESTI', '29243'], ['DRAGESTI', '29341'], ['FINIS', '29403'], ['GEPIU', '32195'], ['GIRISU DE CRIS', '29467'], ['HIDISELU DE SUS', '29519'], ['HOLOD', '29573'], ['HUSASAU DE TINCA', '29662'], ['INEU', '29724'], ['LAZARENI', '29813'], ['LAZURI DE BEIUS', '29760'], ['LUGASU DE JOS', '29902'], ['LUNCA', '29948'], ['MADARAS', '30014'], ['MAGESTI', '30069'], ['NOJORID', '30149'], ['OLCEA', '30229'], ['OSORHEI', '30274'], ['PALEU', '32161'], ['PIETROASA', '30336'], ['POCOLA', '30416'], ['POMEZEU', '30470'], ['POPESTI', '30568'], ['RABAGANI', '30648'], ['REMETEA', '30719'], ['RIENI', '30773'], ['ROSIA', '30844'], ['ROSIORI', '32187'], ['SACADAT', '30871'], ['SALACEA', '30988'], ['SALARD', '31011'], ['SAMBATA', '31057'], ['SANIOB', '28610'], ['SANMARTIN', '26582'], ['SANNICOLAU ROMAN', '32179'], ['SANTANDREI', '26653'], ['SARBI', '31128'], ['SIMIAN', '31333'], ['SINTEU', '31379'], ['SOIMI', '31422'], ['SPINUS', '31208'], ['SUNCUIUS', '31510'], ['SUPLACU DE BARCAU', '31262'], ['TAMASEU', '32153'], ['TARCAIA', '31609'], ['TARCEA', '31565'], ['TAUTEU', '31654'], ['TETCHEA', '31878'], ['TILEAGD', '31716'], ['TINCA', '31789'], ['TOBOLIU', '32201'], ['TULCA', '31841'], ['UILEACU DE BEIUS', '31921'], ['VADU CRISULUI', '31976'], ['VARCIOROG', '32090'], ['VIISOARA', '32045'], ['MUNICIPIUL BISTRITA', '32394'], ['ORAS BECLEAN', '32483'], ['ORAS NASAUD', '32544'], ['ORAS SANGEORZ-BAI', '32599'], ['BISTRITA BARGAULUI', '32633'], ['BRANISTEA', '32660'], ['BUDACU DE JOS', '32704'], ['BUDESTI', '32768'], ['CAIANU MIC', '32811'], ['CETATE', '32884'], ['CHIOCHIS', '33015'], ['CHIUZA', '33122'], ['CICEU-GIURGESTI', '32955'], ['CICEU-MIHAIESTI', '179953'], ['COSBUC', '33177'], ['DUMITRA', '33202'], ['DUMITRITA', '179686'], ['FELDRU', '33248'], ['GALATII BISTRITEI', '33275'], ['ILVA MARE', '33337'], ['ILVA MICA', '33364'], ['JOSENII BARGAULUI', '33382'], ['LECHINTA', '33435'], ['LESU', '33514'], ['LIVEZILE', '33541'], ['LUNCA ILVEI', '33603'], ['MAGURA ILVEI', '33729'], ['MAIERU', '33621'], ['MARISELU', '33765'], ['MATEI', '33658'], ['MICESTII DE CAMPIE', '33845'], ['MILAS', '33881'], ['MONOR', '33952'], ['NEGRILESTI', '179659'], ['NIMIGEA', '33989'], ['NUSENI', '34075'], ['PARVA', '34155'], ['PETRU RARES', '34173'], ['POIANA ILVEI', '179720'], ['PRUNDU BARGAULUI', '34235'], ['REBRA', '34262'], ['REBRISOARA', '34280'], ['RODNA', '34333'], ['ROMULI', '34360'], ['RUNCU SALVEI', '179944'], ['SALVA', '34397'], ['SANMIHAIU DE CAMPIE', '34477'], ['SANT', '34618']], false, '/xmlpserver', false, false, true, true, srh_paramsP_MOC);
    document.getElementById('xdo:parametersCtnr').style.display = 'block';
    SessionTimer.check();
    var myFavorite = new MyFavorite();
    myFavorite.setContextPath('/xmlpserver');
    var displayMessage = function (type, message, paths) {
        var infobar = new InfoBar(parent.document.getElementById('infobar'), 0, 105, true);
        var image = "<img style='vertical-align: text-bottom; width: 18px;' alt='Information ' src='/xmlpserver/resource/editor/infoicon_pagetitle.gif'/>";
        var text = image + " " + message;
        infobar.show(text, '', 4000);
    }
    myFavorite.init({onAdd: displayMessage});
    floatMenu = new FloatMenu({startLink: 'reportViewMenu', setFocus: false, pdfTop: true, dir: 'left'});
    floatMenu.addItem('1', false, 'Export', false, '/resource/blafplus/object/export_ena.png', false, true);
    layouts.exportItemIndex = 1;
    layouts.sendItemIndex = 0;
    layouts.sendDisabled = true;
    floatMenu.addItem('2', false, 'Share Report Link', false, false, false, false);
    floatMenu.addItem('3', 2, 'Current Page', function (e) {
        return linkToReport('http://edemos.insse.ro:80/xmlpserver/PODCA/Reports/Agricultură - silvicultură - mediu.xdo', 'current');
    }, false, false);
    floatMenu.addItem('4', 2, 'No Header', function (e) {
        return linkToReport('http://edemos.insse.ro:80/xmlpserver/PODCA/Reports/Agricultură - silvicultură - mediu.xdo', 'noheader');
    }, false, false);
    floatMenu.addItem('5', 2, 'No Parameters', function (e) {
        return linkToReport('http://edemos.insse.ro:80/xmlpserver/PODCA/Reports/Agricultură - silvicultură - mediu.xdo', 'noparams');
    }, false, false);
    floatMenu.addItem('6', 2, 'Document Only', function (e) {
        return linkToReport('http://edemos.insse.ro:80/xmlpserver/PODCA/Reports/Agricultură - silvicultură - mediu.xdo', 'bodyonly');
    }, false, false);
    if (BrowserDetect.IE) {
        floatMenu.setStartLink('reportViewMenu')
    }

    setLayoutFormat('Agricultură - silvicultură - mediu - cu grafice', 'Interactive', 'analyze', true);
    setLayoutFormat('Agricultură - silvicultură - mediu - cu grafice', 'HTML', 'html');
    setLayoutFormat('Agricultură - silvicultură - mediu - cu grafice', 'PDF', 'pdf');
    setLayoutFormat('Agricultură - silvicultură - mediu - cu grafice', 'RTF', 'rtf');
    setLayoutFormat('Agricultură - silvicultură - mediu - cu grafice', 'Excel (*.xlsx)', 'xlsx');
    setLayoutFormat('Agricultură - silvicultură - mediu - cu grafice', 'PowerPoint (*.pptx)', 'pptx');
    setLayoutFormat('Agricultură - silvicultură - mediu - fără grafice', 'Interactive', 'analyze', true);
    setLayoutFormat('Agricultură - silvicultură - mediu - fără grafice', 'HTML', 'html');
    setLayoutFormat('Agricultură - silvicultură - mediu - fără grafice', 'PDF', 'pdf');
    setLayoutFormat('Agricultură - silvicultură - mediu - fără grafice', 'RTF', 'rtf');
    setLayoutFormat('Agricultură - silvicultură - mediu - fără grafice', 'Excel (*.xlsx)', 'xlsx');
    setLayoutFormat('Agricultură - silvicultură - mediu - fără grafice', 'PowerPoint (*.pptx)', 'pptx');
    layouts.selectedLayoutName = 'Agricultură - silvicultură - mediu - cu grafice';
    tfn = new Array(2);
    tfn[0] = new Array(2);
    tfn[0][0] = 'Agricultură - silvicultură - mediu - cu grafice';
    tfn[0][1] = 'Agricultură - silvicultură - mediu - cu grafice.xpt';
    tfn[1] = new Array(2);
    tfn[1][0] = 'Agricultură - silvicultură - mediu - fără grafice';
    tfn[1][1] = 'Agricultură - silvicultură - mediu - fără grafice.xpt';
    var reportLinksMenu = new Array();
    reportLinksMenu[0] = '<a href="#" onclick="return linkToReport(\'http://edemos.insse.ro:80/xmlpserver/PODCA/Reports/Agricultură - silvicultură - mediu.xdo\',\'current\');">Current Page</a>';
    reportLinksMenu[1] = '<a href="#" onclick="return linkToReport(\'http://edemos.insse.ro:80/xmlpserver/PODCA/Reports/Agricultură - silvicultură - mediu.xdo\',\'noheader\');">No Header</a>';
    reportLinksMenu[2] = '<a href="#" onclick="return linkToReport(\'http://edemos.insse.ro:80/xmlpserver/PODCA/Reports/Agricultură - silvicultură - mediu.xdo\',\'noparams\');">No Parameters</a>';
    reportLinksMenu[3] = '<a href="#" onclick="return linkToReport(\'http://edemos.insse.ro:80/xmlpserver/PODCA/Reports/Agricultură - silvicultură - mediu.xdo\',\'bodyonly\');">Document Only</a>';
    createFormatMenus();
    setExportSubMenu();
    return false;
}

EventUtils.addListener(window, "load", initPage);