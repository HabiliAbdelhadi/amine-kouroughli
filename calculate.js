const calculate = (height, porosity, isSphere = false) => {
  if (porosity <= 0.4) {
    if (isSphere) {
      return {
        a: 0.93272,
        b: 0.93262,
        c: 0.84058,
      };
    } else {
      if (height < 2.25) {
        return {
          a: 0.98629,
          b: 0.98629,
          c: 0.73908,
        };
      } else {
        return {
          a: 0.99242,
          b: 0.99242,
          c: 0.79329,
        };
      }
    }
  } else if (porosity <= 0.6) {
    if (height < 2.25) {
      return {
        a: 0.65121,
        b: 0.65121,
        c: 0.13859,
      };
    } else {
      return {
        a: 0.72944,
        b: 0.72932,
        c: 0.05059,
      };
    }
  } else {
    if (height < 2.25) {
      return {
        a: 0.96181,
        b: 0.47771,
        c: 0.51263,
      };
    } else {
      return {
        a: 0.97241,
        b: 0.97241,
        c: 0.67489,
      };
    }
  }
};

export { calculate };

export const Time = (p, h) => {
  let V = 7.85 * 0.0001 * h * p; // l
  let Q = 0.0000375; // l/h
  return V / Q; // h
};

//y = a-b*pow(c,x)
