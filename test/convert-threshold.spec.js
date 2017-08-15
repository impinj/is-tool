const converter = require('../is-tool-lib').convertThreshold;


describe('When converting a null object, it', () => {
  it('should rerturn a reject promise', () => {
    const promise = converter(null);
    return expect(promise).to.be.rejectedWith('null object passed, cannot convert');
  });
});

describe('When converting an empty object, it', () => {
  it('should return an empty object', () => {
    const promise = converter({});
    return expect(promise).to.eventually.eql({});
  });
});

describe('When converting a single reader with no sides, it', () => {
  it('should produce an antenna object with 2 antennas when 2 are defined and set arrangement to OVERHEAD', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-0A": {
            "antennas": [{
                "antenna": 7,
                "door": "2",
                "orientation": "out"
              },
              {
                "antenna": 8,
                "door": "2",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-0A"
          }
        }
      }
    }, "fv12");

    return expect(promise).to.eventually.eql({
      "antennaConfigurations":[
        {
          "name": "center-out-7-in-8",
          "out": [
            { "antennaId": 7 }
          ],
          "in": [
            { "antennaId": 8 }
          ]
        }
      ],
      "thresholds": [
        {
          "name": "2",
          "facility": "fv12",
          "readerArrangement": "OVERHEAD",
          "readers": {
            "xSpan-11-F0-0A": {
              "antennaConfigurationId": "center-out-7-in-8"
            }
          }
        }
      ]
    });
  });


  it('should produce an antenna object with 3 antennas when 3 are defined and set arrangement to OVERHEAD', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-0A": {
            "antennas": [{
                "antenna": 7,
                "door": "2",
                "orientation": "out"
              },
              {
                "antenna": 8,
                "door": "2",
                "orientation": "in"
              },
              {
                "antenna": 9,
                "door": "2",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-0A"
          }
        }
      }
    }, "fv12");

    return expect(promise).to.eventually.eql({
      "antennaConfigurations":[
        {
          "name": "center-out-7-in-8-9",
          "out": [
            { "antennaId": 7 }
          ],
          "in": [
            { "antennaId": 8 },
            { "antennaId": 9 }
          ]
        }
      ],
      "thresholds": [
        {
          "name": "2",
          "facility": "fv12",
          "readerArrangement": "OVERHEAD",
          "readers": {
            "xSpan-11-F0-0A": {
              "antennaConfigurationId": "center-out-7-in-8-9"
            }
          }
        }
      ]
    });
  });

  it('should produce an OVERHEAD threshold when 2 readers are assigned to one door', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-0A": {
            "antennas": [{
                "antenna": 7,
                "door": "2",
                "orientation": "out"
              },
              {
                "antenna": 8,
                "door": "2",
                "orientation": "in"
              },
              {
                "antenna": 9,
                "door": "2",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-0A"
          },

          "11-F0-22": {
            "antennas": [{
                "antenna": 7,
                "door": "2",
                "orientation": "out"
              },
              {
                "antenna": 8,
                "door": "2",
                "orientation": "in"
              },
              {
                "antenna": 9,
                "door": "2",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-22"
          }

        }
      }
    }, "fv12");

    return expect(promise).to.eventually.eql({
      "antennaConfigurations":[
        {
          "name": "center-out-7-in-8-9",
          "out": [
            { "antennaId": 7 }
          ],
          "in": [
            { "antennaId": 8 },
            { "antennaId": 9 }
          ]
        }
      ],
      "thresholds": [
        {
          "name": "2",
          "facility": "fv12",
          "readerArrangement": "OVERHEAD",
          "readers": {
            "xSpan-11-F0-0A": {
              "antennaConfigurationId": "center-out-7-in-8-9"
            },
            "xSpan-11-F0-22": {
              "antennaConfigurationId": "center-out-7-in-8-9"
            }
          }
        }
      ]
    });
  });

  it('should raise an error when multiple doors on same reader', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-0A": {
            "antennas": [{
                "antenna": 7,
                "door": "2",
                "orientation": "out"
              },
              {
                "antenna": 8,
                "door": "2",
                "orientation": "in"
              },
              {
                "antenna": 9,
                "door": "3",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-0A"
          }
        }
      }
    }, "fv12");
    return expect(promise).to.eventually.be.rejectedWith('Invalid Config: reader without side specified cannot belong to multiple doors');
  });
});

describe('When converting readers, assigned to one door, it', () => {
    it('should produce 2 antenna objects when 2 readers are defined and set arrangement to SIDE_BY_SIDE', () => {
      let promise = converter({
        "reader-manager-config" : {
          "readers": {
            "11-F0-0A": {
              "antennas": [{
                  "antenna": 18,
                  "door": "2",
                  "side": "left",
                  "orientation": "out"
                },
                {
                  "antenna": 20,
                  "door": "2",
                  "side": "left",
                  "orientation": "in"
                }
              ],
              "host": "xSpan-11-F0-0A"
            },
            "11-F0-11": {
              "antennas": [{
                  "antenna": 16,
                  "door": "2",
                  "side": "right",
                  "orientation": "out"
                },
                {
                    "antenna": 24,
                    "door": "2",
                    "side": "right",
                    "orientation": "out"
                },
                {
                  "antenna": 14,
                  "door": "2",
                  "side": "right",
                  "orientation": "in"
                }
              ],
              "host": "xSpan-11-F0-11"
            }
          }
        }
      }, "fv12");

      return expect(promise).to.eventually.eql({
        "antennaConfigurations":[
          {
            "name": "left-out-18-in-20",
            "side": "left",
            "out": [
              { "antennaId": 18 }
            ],
            "in": [
              { "antennaId": 20 }
            ]
          },
          {
            "name": "right-out-16-24-in-14",
            "side": "right",
            "out": [
              { "antennaId": 16 },
              { "antennaId": 24 }
            ],
            "in": [
              { "antennaId": 14 }
            ]
          }
        ],
        "thresholds": [
          {
            "name": "2",
            "facility": "fv12",
            "readerArrangement": "SIDE_BY_SIDE",
            "readers": {
              "xSpan-11-F0-0A": {
                "antennaConfigurationId": "left-out-18-in-20"
              },
              "xSpan-11-F0-11": {
                "antennaConfigurationId": "right-out-16-24-in-14"
              }
            }
          }
        ]
      });
    });

    it('should convert double stacked SIDE_BY_SIDE arrangements', () => {
      let promise = converter({
        "reader-manager-config" : {
          "readers": {
            "11-F0-0A": {
              "antennas": [{
                  "antenna": 16,
                  "door": "2",
                  "side": "left",
                  "orientation": "out"
                },
                {
                  "antenna": 19,
                  "door": "2",
                  "side": "left",
                  "orientation": "in"
                }
              ],
              "host": "xSpan-11-F0-0A"
            },
            "11-F0-11": {
              "antennas": [{
                  "antenna": 7,
                  "door": "2",
                  "side": "right",
                  "orientation": "out"
                },
                {
                  "antenna": 8,
                  "door": "2",
                  "side": "right",
                  "orientation": "in"
                }
              ],
              "host": "xSpan-11-F0-11"
            },
            "11-F0-22": {
              "antennas": [{
                  "antenna": 16,
                  "door": "2",
                  "side": "left",
                  "orientation": "out"
                },
                {
                  "antenna": 19,
                  "door": "2",
                  "side": "left",
                  "orientation": "in"
                }
              ],
              "host": "xSpan-11-F0-22"
            },
            "11-F0-33": {
              "antennas": [{
                  "antenna": 7,
                  "door": "2",
                  "side": "right",
                  "orientation": "out"
                },
                {
                  "antenna": 8,
                  "door": "2",
                  "side": "right",
                  "orientation": "in"
                }
              ],
              "host": "xSpan-11-F0-33"
            }
          }
        }
      }, "fv12");
      return expect(promise).to.eventually.eql({
        "antennaConfigurations":[
          {
            "name": "left-out-16-in-19",
            "side": "left",
            "out": [
              { "antennaId": 16 }
            ],
            "in": [
              { "antennaId": 19 }
            ]
          },
          {
            "name": "right-out-7-in-8",
            "side": "right",
            "out": [
              { "antennaId": 7 }
            ],
            "in": [
              { "antennaId": 8 }
            ]
          }
        ],
        "thresholds": [
          {
            "name": "2",
            "facility": "fv12",
            "readerArrangement": "SIDE_BY_SIDE",
            "readers": {
              "xSpan-11-F0-0A": {
                "antennaConfigurationId": "left-out-16-in-19"
              },
              "xSpan-11-F0-11": {
                "antennaConfigurationId": "right-out-7-in-8"
              },
              "xSpan-11-F0-22": {
                "antennaConfigurationId": "left-out-16-in-19"
              },
              "xSpan-11-F0-33": {
                "antennaConfigurationId": "right-out-7-in-8"
              }
            }
          }
        ]
      });
    });

    it('should convert uneven stacked SIDE_BY_SIDE arrangements', () => {
      let promise = converter({
        "reader-manager-config" : {
          "readers": {
            "11-F0-0A": {
              "antennas": [{
                  "antenna": 16,
                  "door": "2",
                  "side": "left",
                  "orientation": "out"
                },
                {
                  "antenna": 19,
                  "door": "2",
                  "side": "left",
                  "orientation": "in"
                }
              ],
              "host": "xSpan-11-F0-0A"
            },
            "11-F0-11": {
              "antennas": [{
                  "antenna": 7,
                  "door": "2",
                  "side": "right",
                  "orientation": "out"
                },
                {
                  "antenna": 8,
                  "door": "2",
                  "side": "right",
                  "orientation": "in"
                }
              ],
              "host": "xSpan-11-F0-11"
            },
            "11-F0-22": {
              "antennas": [{
                  "antenna": 16,
                  "door": "2",
                  "side": "left",
                  "orientation": "out"
                },
                {
                  "antenna": 19,
                  "door": "2",
                  "side": "left",
                  "orientation": "in"
                }
              ],
              "host": "xSpan-11-F0-22"
            },
          }
        }
      }, "fv12");

      return expect(promise).to.eventually.eql({
        "antennaConfigurations":[
          {
            "name": "left-out-16-in-19",
            "side": "left",
            "out": [
              { "antennaId": 16 }
            ],
            "in": [
              { "antennaId": 19 }
            ]
          },
          {
            "name": "right-out-7-in-8",
            "side": "right",
            "out": [
              { "antennaId": 7 }
            ],
            "in": [
              { "antennaId": 8 }
            ]
          }
        ],
        "thresholds": [
          {
            "name": "2",
            "facility": "fv12",
            "readerArrangement": "SIDE_BY_SIDE",
            "readers": {
              "xSpan-11-F0-0A": {
                "antennaConfigurationId": "left-out-16-in-19"
              },
              "xSpan-11-F0-11": {
                "antennaConfigurationId": "right-out-7-in-8"
              },
              "xSpan-11-F0-22": {
                "antennaConfigurationId": "left-out-16-in-19"
              }
            }
          }
        ]
      });
    });
});
describe('When converting readers in overhead offset arrangement, it', () => {
  it('should convert one reader assigned to two doors', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-0A": {
            "antennas": [{
                "antenna": 18,
                "door": "2",
                "side": "left",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "2",
                "side": "left",
                "orientation": "in"
              },
              {
                  "antenna": 16,
                  "door": "3",
                  "side": "right",
                  "orientation": "out"
                },
                {
                    "antenna": 24,
                    "door": "3",
                    "side": "right",
                    "orientation": "out"
                },
                {
                  "antenna": 14,
                  "door": "3",
                  "side": "right",
                  "orientation": "in"
                }
            ],
            "host": "xSpan-11-F0-0A"
          }
        }
      }
    }, "fv12");

    return expect(promise).to.eventually.eql({
      "antennaConfigurations":[
        {
          "name": "right-out-16-24-in-14",
          "side": "right",
          "out": [
            { "antennaId": 16 },
            { "antennaId": 24 }
          ],
          "in": [
            { "antennaId": 14 }
          ]
        },
        {
          "name": "left-out-18-in-20",
          "side": "left",
          "out": [
            { "antennaId": 18 }
          ],
          "in": [
            { "antennaId": 20 }
          ]
        }
      ],
      "thresholds": [
        {
          "name": "2",
          "facility": "fv12",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-0A": {  "antennaConfigurationId": "left-out-18-in-20" }
          }
        },
        {
          "name": "3",
          "facility": "fv12",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-0A": { "antennaConfigurationId": "right-out-16-24-in-14" }
          }
        }
      ]
    });
  });

  it('should convert three readers assigned to two doors', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-11": {
            "antennas": [
              {
                  "antenna": 16,
                  "door": "3",
                  "side": "right",
                  "orientation": "out"
                },
                {
                    "antenna": 24,
                    "door": "3",
                    "side": "right",
                    "orientation": "out"
                },
                {
                  "antenna": 14,
                  "door": "3",
                  "side": "right",
                  "orientation": "in"
                }
            ],
            "host": "xSpan-11-F0-11"
          },
          "11-F0-22": {
            "antennas": [{
                "antenna": 18,
                "door": "3",
                "side": "left",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "3",
                "side": "left",
                "orientation": "in"
              },
              {
                  "antenna": 16,
                  "door": "2",
                  "side": "right",
                  "orientation": "out"
                },
                {
                    "antenna": 24,
                    "door": "2",
                    "side": "right",
                    "orientation": "out"
                },
                {
                  "antenna": 14,
                  "door": "2",
                  "side": "right",
                  "orientation": "in"
                }
            ],
            "host": "xSpan-11-F0-22"
          },
          "11-F0-33": {
            "antennas": [{
                "antenna": 18,
                "door": "2",
                "side": "left",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "2",
                "side": "left",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-33"
          }
        }
      }
    }, "fv12");
    return expect(promise).to.eventually.eql({
      "antennaConfigurations":[
        {
          "name": "right-out-16-24-in-14",
          "side": "right",
          "out": [
            { "antennaId": 16 },
            { "antennaId": 24 }
          ],
          "in": [ { "antennaId": 14 } ]
        },
        {
          "name": "left-out-18-in-20",
          "side": "left",
          "out": [ { "antennaId": 18 } ],
          "in": [ { "antennaId": 20 } ]
        }
      ],
      "thresholds": [
        {
          "name": "2",
          "facility": "fv12",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-22": { "antennaConfigurationId": "right-out-16-24-in-14" },
            "xSpan-11-F0-33": { "antennaConfigurationId": "left-out-18-in-20" }
          }
        },
        {
          "name": "3",
          "facility": "fv12",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-11": { "antennaConfigurationId": "right-out-16-24-in-14" },
            "xSpan-11-F0-22": { "antennaConfigurationId": "left-out-18-in-20" }
          }
        }
      ]
    });
  });
  it('should convert 4 readers assigned to three doors', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-11": {
            "antennas": [
              {
                  "antenna": 16,
                  "door": "1",
                  "side": "right",
                  "orientation": "out"
                },
                {
                    "antenna": 24,
                    "door": "1",
                    "side": "right",
                    "orientation": "out"
                },
                {
                  "antenna": 14,
                  "door": "1",
                  "side": "right",
                  "orientation": "in"
                }
            ],
            "host": "xSpan-11-F0-11"
          },
          "11-F0-22": {
            "antennas": [{
                "antenna": 18,
                "door": "1",
                "side": "left",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "1",
                "side": "left",
                "orientation": "in"
              },
              {
                  "antenna": 16,
                  "door": "2",
                  "side": "right",
                  "orientation": "out"
                },
                {
                    "antenna": 24,
                    "door": "2",
                    "side": "right",
                    "orientation": "out"
                },
                {
                  "antenna": 14,
                  "door": "2",
                  "side": "right",
                  "orientation": "in"
                }
            ],
            "host": "xSpan-11-F0-22"
          },
          "11-F0-33": {
            "antennas": [{
                "antenna": 18,
                "door": "2",
                "side": "left",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "2",
                "side": "left",
                "orientation": "in"
              },
              {
                  "antenna": 16,
                  "door": "3",
                  "side": "right",
                  "orientation": "out"
                },
                {
                    "antenna": 24,
                    "door": "3",
                    "side": "right",
                    "orientation": "out"
                },
                {
                  "antenna": 14,
                  "door": "3",
                  "side": "right",
                  "orientation": "in"
                }
            ],
            "host": "xSpan-11-F0-33"
          },
          "11-F0-44": {
            "antennas": [{
                "antenna": 18,
                "door": "3",
                "side": "left",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "3",
                "side": "left",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-44"
          }
        }
      }
    }, "fv12");
    return expect(promise).to.eventually.eql({
      "antennaConfigurations":[
        {
          "name": "right-out-16-24-in-14",
          "side": "right",
          "out": [
            { "antennaId": 16 },
            { "antennaId": 24 }
          ],
          "in": [ { "antennaId": 14 } ]
        },
        {
          "name": "left-out-18-in-20",
          "side": "left",
          "out": [ { "antennaId": 18 } ],
          "in": [ { "antennaId": 20 } ]
        }
      ],
      "thresholds": [
        {
          "name": "1",
          "facility": "fv12",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-11": { "antennaConfigurationId": "right-out-16-24-in-14" },
            "xSpan-11-F0-22": { "antennaConfigurationId": "left-out-18-in-20" }
          }
        },
        {
          "name": "2",
          "facility": "fv12",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-22": { "antennaConfigurationId": "right-out-16-24-in-14" },
            "xSpan-11-F0-33": { "antennaConfigurationId": "left-out-18-in-20" }
          }
        },
        {
          "name": "3",
          "facility": "fv12",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-33": { "antennaConfigurationId": "right-out-16-24-in-14" },
            "xSpan-11-F0-44": { "antennaConfigurationId": "left-out-18-in-20" }
          }
        }
      ]
    });
  });
});

describe('When converting readers, it', () => {
  it('should assign all thresholds to the pass facilty', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-0A": {
            "antennas": [{
                "antenna": 18,
                "door": "2",
                "side": "left",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "2",
                "side": "left",
                "orientation": "in"
              },
              {
                "antenna": 16,
                "door": "3",
                "side": "right",
                "orientation": "out"
              },
              {
                  "antenna": 24,
                  "door": "3",
                  "side": "right",
                  "orientation": "out"
              },
              {
                "antenna": 14,
                "door": "3",
                "side": "right",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-0A"
          }
        }
      }
    }, "test");

    return expect(promise).to.eventually.eql({
      "antennaConfigurations":[
        {
          "name": "right-out-16-24-in-14",
          "side": "right",
          "out": [
            { "antennaId": 16 },
            { "antennaId": 24 }
          ],
          "in": [
            { "antennaId": 14 }
          ]
        },
        {
          "name": "left-out-18-in-20",
          "side": "left",
          "out": [
            { "antennaId": 18 }
          ],
          "in": [
            { "antennaId": 20 }
          ]
        }
      ],
      "thresholds": [
        {
          "name": "2",
          "facility": "test",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-0A": {  "antennaConfigurationId": "left-out-18-in-20" }
          }
        },
        {
          "name": "3",
          "facility": "test",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-0A": { "antennaConfigurationId": "right-out-16-24-in-14" }
          }
        }
      ]
    });
  });

  it('accepts any casing for antenna orientation', () => {
    let promise = converter({
      "reader-manager-config": {
        "readers": {
          "11-F0-0A": {
            "antennas": [{
              "antenna": 18,
              "door": "2",
              "side": "left",
              "orientation": "out"
            },
            {
              "antenna": 20,
              "door": "2",
              "side": "left",
              "orientation": "IN"
            },
            {
              "antenna": 16,
              "door": "3",
              "side": "right",
              "orientation": "OUT"
            },
            {
              "antenna": 24,
              "door": "3",
              "side": "right",
              "orientation": "out"
            },
            {
              "antenna": 14,
              "door": "3",
              "side": "right",
              "orientation": "in"
            }
            ],
            "host": "xSpan-11-F0-0A"
          }
        }
      }
    }, "test");

    return expect(promise).to.eventually.eql({
      "antennaConfigurations": [
        {
          "name": "right-out-16-24-in-14",
          "side": "right",
          "out": [
            { "antennaId": 16 },
            { "antennaId": 24 }
          ],
          "in": [
            { "antennaId": 14 }
          ]
        },
        {
          "name": "left-out-18-in-20",
          "side": "left",
          "out": [
            { "antennaId": 18 }
          ],
          "in": [
            { "antennaId": 20 }
          ]
        }
      ],
      "thresholds": [
        {
          "name": "2",
          "facility": "test",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-0A": { "antennaConfigurationId": "left-out-18-in-20" }
          }
        },
        {
          "name": "3",
          "facility": "test",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-0A": { "antennaConfigurationId": "right-out-16-24-in-14" }
          }
        }
      ]
    });
  });

  it('should assign facility to DEFAULT when none is passed in', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-0A": {
            "antennas": [{
                "antenna": 18,
                "door": "2",
                "side": "left",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "2",
                "side": "left",
                "orientation": "in"
              },
              {
                  "antenna": 16,
                  "door": "3",
                  "side": "right",
                  "orientation": "out"
                },
                {
                    "antenna": 24,
                    "door": "3",
                    "side": "right",
                    "orientation": "out"
                },
                {
                  "antenna": 14,
                  "door": "3",
                  "side": "right",
                  "orientation": "in"
                }
            ],
            "host": "xSpan-11-F0-0A"
          }
        }
      }
    });

    return expect(promise).to.eventually.eql({
      "antennaConfigurations":[
        {
          "name": "right-out-16-24-in-14",
          "side": "right",
          "out": [
            { "antennaId": 16 },
            { "antennaId": 24 }
          ],
          "in": [
            { "antennaId": 14 }
          ]
        },
        {
          "name": "left-out-18-in-20",
          "side": "left",
          "out": [
            { "antennaId": 18 }
          ],
          "in": [
            { "antennaId": 20 }
          ]
        }
      ],
      "thresholds": [
        {
          "name": "2",
          "facility": "DEFAULT",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-0A": {  "antennaConfigurationId": "left-out-18-in-20" }
          }
        },
        {
          "name": "3",
          "facility": "DEFAULT",
          "readerArrangement": "OVERHEAD_OFFSET",
          "readers": {
            "xSpan-11-F0-0A": { "antennaConfigurationId": "right-out-16-24-in-14" }
          }
        }
      ]
    });
  });

  it('should raise error when reader is part of single door and 2 sides specified', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-0A": {
            "antennas": [{
                "antenna": 18,
                "door": "2",
                "side": "left",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "2",
                "side": "right",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-0A"
          }
        }
      }
    });

    return expect(promise).to.eventually.be.rejectedWith(
      'Invalid Config: reader cannot belong to one door with ' +
      'multiple sides specified'
    );
  });

  it('should raise error when reader without sides is part of same door as reader with sides', () => {
    let promise = converter({
      "reader-manager-config" : {
        "readers": {
          "11-F0-11": {
            "antennas": [{
                "antenna": 18,
                "door": "2",
                "side": "left",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "2",
                "side": "left",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-11"
          },
          "11-F0-22": {
            "antennas": [{
                "antenna": 18,
                "door": "2",
                "orientation": "out"
              },
              {
                "antenna": 20,
                "door": "2",
                "orientation": "in"
              }
            ],
            "host": "xSpan-11-F0-22"
          }
        }
      }
    });
    return expect(promise).to.eventually.be.rejectedWith(
      'Invalid Config: reader without side specifed cannot belong ' +
      'to the same door as a reader with a side specified'
    );
  });
});
