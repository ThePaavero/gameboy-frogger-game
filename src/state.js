/**
 * Your Game's state object. Feel free to split it up if your state is complicated/large.
 */
export default {
  player: {
    x: 0,
    y: 0,
    width: 5,
    height: 10,
    speed: 0.4,
    velocities: {
      x: 0,
      y: 0,
    },
  },
  carTypes: [
    {
      slug: 'sedan',
      width: 19,
      height: 10,
    },
    {
      slug: 'wagon',
      width: 22,
      height: 10,
    },
    {
      slug: 'truck',
      width: 30,
      height: 20,
    }
  ],
  cars: [],
}
