window.onload = initAll;

function initAll() {
  document.getElementById("fullName").select();
  document.getElementById("emoSubmit").onclick = function() {
    document.getElementById("msgField").innerHTML = getEmoBandName();
    return false;
  }
}

// returns a number between min and max
function randomBetween(min, max, seed) {
  Math.seedrandom(seed);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getEmoBandName() {
  var joiners = ["The", "At", "In", "And", "On", "Of", "With", "Between"];
  var prefixes = ["Hey", "My", "Your", "Our", "The", "Between", "Since The", "A", "And", "New", "Old", "At", "In", "Into", "Inside", "Near", "Of", "On", "Outside", "Over", "With", "Within", "Without", "Around", "Besides", "Beside", "After", "Against", "Off", "During", "Down", "Like", "Near", "Along", "Beneath", "Under", "Toward", "Till", "Up", "Until", "Through", "Throughout", "Except", "For", "From", "Past", "Burning", "Sleeping", "Further", "Always", "Sometimes", "Perhaps"];
  var nouns = ["Ring", "Promise", "Texas", "New York", "Music", "Hearts", "Kids", "Surprise", "Reason", "Kentucky", "Oklahoma", "Mississippi", "Rangers", "Fence", "Cap'n", "Mandy", "Chester", "Jimmy", "Johnny", "Jazz", "Experiment", "Drive", "North", "South", "East", "West", "Coalition", "New", "Boys", "Girls", "Plan", "Disco", "Star", "Maplewood", "Orange", "Mercedes", "Omaha", "Hoboken", "Newark", "Ho-Ho-Kus", "Second", "Asbury", "Trenton", "Cherry Hill", "Morrisville", "Elizabeth", "Morristown", "Clifton", "Hackettstown", "Theory", "Juliana", "Joan", "Parade", "Romance", "Hayward", "Fremont", "Pittsburg", "Josie", "Ethel", "Aberdeen", "Barnegat", "Belleville", "Bergenfield", "Berkeley", "Bloomfield", "Camden", "Cliffside Park", "Edison", "Englewood", "Fort Lee", "Jackson", "Keansburg", "Kearny", "Hackensack", "Glen Rock", "Middlesex", "Millburn", "Montclair", "Lumberton", "Lyndhurst", "Passaic", "Roseville", "Pine Hill", "Rutherford", "Saddle Brook", "Teaneck", "Secaucus", "Warren", "Wayne", "Weehawken", "Winslow", "Woodbridge", "Windsor", "Love", "Boy"];
  var timeunits = ["Sunday", "Day", "Night", "Year", "Week", "Month", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "January", "February", "March", "April", "May", "June", "July", "August", "September", "November", "December", "Winter", "Spring", "Summer", "Autumn", "Mid-Winter", "Indian Summer", "Evening", "Morning", "Afternoon", "Mid-Morning", "Twilight", "Dusk", "Sunrise", "Sunset", "Forever", "Never", "Always", "Sometimes"];

  var fullName = document.getElementById("fullName").value;

  // initialize array which will become the emo band name
  var emoBand = [];
  console.log("emoBand initialized = " + emoBand);

  if (fullName.length == 0) {
    fullName = Math.random().toString(36).substring(2);
    console.log("fullname = " + fullName);
  }

  if (fullName.length > 0) {
    // Preselect prefix, joiner, noun and timeunit from their respective lists
    var prefix = prefixes[randomBetween(0, prefixes.length - 1, fullName)];
    var joiner = joiners[randomBetween(0, joiners.length - 1, fullName)];
    var noun = nouns[randomBetween(0, nouns.length - 1, fullName)];
    var timeunit = timeunits[randomBetween(0, timeunits.length - 1, fullName)];

    // The "magicnumber" between 1 and 100 will determine the emo band name
    var magicnumber = randomBetween(1, 100, fullName);
    console.log("magicnumber = " + magicnumber);

    // base noun
    emoBand.push(noun);
    console.log("emoBand base noun= " + emoBand);

    // 75% chance of prefix
    if (magicnumber > 25) {
      emoBand.splice(0, 0, prefix);
    }
    console.log("emoBand after prefix roll = " + emoBand);

    if (magicnumber < 50) { // Use a time unit? 50% odds
      console.log("Time unit true.");
      if ((magicnumber % 2) == 0) { // Time unit is suffix? 50% odds
        console.log("magicnumber = " + magicnumber + "Time unit is a suffix.")
        if (/[io]/.test(fullName)) { // Use a joiner? only if fullName has 'i' or 'o' in it.
          emoBand.push(joiner);
          console.log("fullName has i or o. time as suffix, with joiner = " + emoBand);
        }
        emoBand.push(timeunit);
        console.log("time as suffix, no joiner = " + emoBand);
      }
    } else { // Time Unit is a prefix
      console.log("Time unit is a prefix.");
      // use a joiner?
      if (randomBetween(0, 2, fullName) == 0) {
        emoBand.splice(0, 0, joiner);
      }
      emoBand.splice(0, 0, timeunit);
      console.log("emoBand=" + emoBand);
    }
  }

  // Band names should be sentence fragments. Final check to avoid 1 word results.
  if (emoBand.length == 1) {
    emoBand.splice(0, 0, prefix);
    emoBand.splice(0, 0, joiner);
  }

  return "Your emo band name is: <span style='font-weight: bold;'>" + emoBand.join(' ') + "</span>";
}

// CODE BELOW implements the "seedrandom()" function

/*
Copyright 2014 David Bau.
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function(pool, math) {
  //
  // The following constants are related to IEEE 754 limits.
  //
  var global = this,
    width = 256, // each RC4 output is 0 <= x < 256
    chunks = 6, // at least six RC4 outputs for each double
    digits = 52, // there are 52 significant digits in a double
    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto; // node.js crypto module, initialized at the bottom.

  //
  // seedrandom()
  // This is the seedrandom function described above.
  //
  function seedrandom(seed, options, callback) {
    var key = [];
    options = (options == true) ? {
      entropy: true
    } : (options || {});

    // Flatten the seed string or build one from local entropy if needed.
    var shortseed = mixkey(flatten(
      options.entropy ? [seed, tostring(pool)] :
      (seed == null) ? autoseed() : seed, 3), key);

    // Use the seed to initialize an ARC4 generator.
    var arc4 = new ARC4(key);

    // This function returns a random double in [0, 1) that contains
    // randomness in every bit of the mantissa of the IEEE 754 value.
    var prng = function() {
      var n = arc4.g(chunks), // Start with a numerator n < 2 ^ 48
        d = startdenom, //   and denominator d = 2 ^ 48.
        x = 0; //   and no 'extra last byte'.
      while (n < significance) { // Fill up all significant digits by
        n = (n + x) * width; //   shifting numerator and
        d *= width; //   denominator and generating a
        x = arc4.g(1); //   new least-significant-byte.
      }
      while (n >= overflow) { // To avoid rounding up, before adding
        n /= 2; //   last byte, shift everything
        d /= 2; //   right using integer math until
        x >>>= 1; //   we have exactly the desired bits.
      }
      return (n + x) / d; // Form the number within [0, 1).
    };

    prng.int32 = function() {
      return arc4.g(4) | 0;
    }
    prng.quick = function() {
      return arc4.g(4) / 0x100000000;
    }
    prng.double = prng;

    // Mix the randomness into accumulated entropy.
    mixkey(tostring(arc4.S), pool);

    // Calling convention: what to return as a function of prng, seed, is_math.
    return (options.pass || callback ||
      function(prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) {
            copy(state, arc4);
          }
          // Only provide the .state method if requested via options.state.
          prng.state = function() {
            return copy(arc4, {});
          }
        }

        // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.
        if (is_math_call) {
          math[rngname] = prng;
          return seed;
        }

        // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(
      prng,
      shortseed,
      'global' in options ? options.global : (this == math),
      options.state);
  }
  math['seed' + rngname] = seedrandom;

  //
  // ARC4
  //
  // An ARC4 implementation.  The constructor takes a key in the form of
  // an array of at most (width) integers that should be 0 <= x < (width).
  //
  // The g(count) method returns a pseudorandom integer that concatenates
  // the next (count) outputs from ARC4.  Its return value is a number x
  // that is in the range 0 <= x < (width ^ count).
  //
  function ARC4(key) {
    var t, keylen = key.length,
      me = this,
      i = 0,
      j = me.i = me.j = 0,
      s = me.S = [];

    // The empty key [] is treated as [0].
    if (!keylen) {
      key = [keylen++];
    }

    // Set up S using the standard key scheduling algorithm.
    while (i < width) {
      s[i] = i++;
    }
    for (i = 0; i < width; i++) {
      s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
      s[j] = t;
    }

    // The "g" method returns the next (count) outputs as one number.
    (me.g = function(count) {
      // Using instance members instead of closure state nearly doubles speed.
      var t, r = 0,
        i = me.i,
        j = me.j,
        s = me.S;
      while (count--) {
        t = s[i = mask & (i + 1)];
        r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
      }
      me.i = i;
      me.j = j;
      return r;
      // For robust unpredictability, the function call below automatically
      // discards an initial batch of values.  This is called RC4-drop[256].
      // See http://google.com/search?q=rsa+fluhrer+response&btnI
    })(width);
  }

  //
  // copy()
  // Copies internal state of ARC4 to or from a plain object.
  //
  function copy(f, t) {
    t.i = f.i;
    t.j = f.j;
    t.S = f.S.slice();
    return t;
  };

  //
  // flatten()
  // Converts an object tree to nested arrays of strings.
  //
  function flatten(obj, depth) {
    var result = [],
      typ = (typeof obj),
      prop;
    if (depth && typ == 'object') {
      for (prop in obj) {
        try {
          result.push(flatten(obj[prop], depth - 1));
        } catch (e) {}
      }
    }
    return (result.length ? result : typ == 'string' ? obj : obj + '\0');
  }

  //
  // mixkey()
  // Mixes a string seed into a key that is an array of integers, and
  // returns a shortened string seed that is equivalent to the result key.
  //
  function mixkey(seed, key) {
    var stringseed = seed + '',
      smear, j = 0;
    while (j < stringseed.length) {
      key[mask & j] =
        mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
    }
    return tostring(key);
  }

  //
  // autoseed()
  // Returns an object for autoseeding, using window.crypto and Node crypto
  // module if available.
  //
  function autoseed() {
    try {
      if (nodecrypto) {
        return tostring(nodecrypto.randomBytes(width));
      }
      var out = new Uint8Array(width);
      (global.crypto || global.msCrypto).getRandomValues(out);
      return tostring(out);
    } catch (e) {
      var browser = global.navigator,
        plugins = browser && browser.plugins;
      return [+new Date, global, plugins, global.screen, tostring(pool)];
    }
  }

  //
  // tostring()
  // Converts an array of charcodes to a string
  //
  function tostring(a) {
    return String.fromCharCode.apply(0, a);
  }

  //
  // When seedrandom.js is loaded, we immediately mix a few bits
  // from the built-in RNG into the entropy pool.  Because we do
  // not want to interfere with deterministic PRNG state later,
  // seedrandom will not call math.random on its own again after
  // initialization.
  //
  mixkey(math.random(), pool);

  //
  // Nodejs and AMD support: export the implementation as a module using
  // either convention.
  //
  if ((typeof module) == 'object' && module.exports) {
    module.exports = seedrandom;
    // When in node.js, try using crypto package for autoseeding.
    try {
      nodecrypto = require('crypto');
    } catch (ex) {}
  } else if ((typeof define) == 'function' && define.amd) {
    define(function() {
      return seedrandom;
    });
  }

  // End anonymous scope, and pass initial values.
})(
  [], // pool: entropy pool starts empty
  Math // math: package containing random, pow, and seedrandom
);
