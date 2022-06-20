class Cinema {
  constructor() {
    this.movies = [];
    this.screens = [];
  }

  addScreen(screenName, capacity) {
    if (!this.isScreen(screenName))
      // Could be a new class
      this.screens.push({
        name: screenName,
        capacity: capacity,
        showings: [],
      });
    else throw Error('Screen already exists');
  }

  isScreen(screenName) {
    let result = false;
    this.screens.forEach((screen) => {
      if (screen.name.includes(screenName)) result = true;
    });
    return result;
  }

  isMovie(movieName) {
    let result = false;
    this.movies.forEach((movie) => {
      if (movie.name.includes(movieName)) result = true;
    });
    return result;
  }

  getMovie(movieName) {
    let result = this.isMovie(movieName);
    this.movies.forEach((movie) => {
      if (movie.name.includes(movieName)) result = movie;
    });
    if (!result) throw Error('Film does not exist');
    return result;
  }

  getScreen(screenName) {
    let result = this.isScreen(screenName);
    this.screens.forEach((screen) => {
      if (screen.name.includes(screenName)) result = screen;
    });
    if (!result) throw Error('Invalid screen');
    return result;
  }

  isMovieRatingValid(rating) {
    const movieRatings = ['U', 'PG', '12', '15', '18'];
    if (!movieRatings.includes(rating)) return false;
    return true;
  }

  isTimeValid(duration) {
    const result = /^(\d?\d):(\d\d)$/.exec(duration);
    if (result == null) return false;
    const hours = parseInt(result[1]);
    const mins = parseInt(result[2]);
    if (hours < 0 || (hours <= 0 && mins <= 0) || mins > 60) return false;
    return true;
  }
  // Could be in new Movie class
  addMovie(movieName, rating, duration) {
    if (this.isMovie(movieName)) throw Error('Film already exists');
    if (!this.isMovieRatingValid(rating)) throw Error('Invalid rating');
    if (!this.isTimeValid(duration)) throw Error('Invalid duration');
    this.movies.push({ name: movieName, rating, duration });
  }

  getShowingStartTime(startTime) {
    if (!this.isTimeValid(startTime)) throw Error('Invalid start time');
    const startTimeHours = Number(startTime.split(':')[0]);
    const startTimeMinutes = Number(startTime.split(':')[1]);
    return [startTimeHours, startTimeMinutes];
  }

  getShowingEndTime(movieName, startTime) {
    const [startTimeHours, startTimeMinutes] = this.getShowingStartTime(startTime);
    const [durationHours, durationMins] = this.getMovieDuration(movieName);
    let endTimeHours = startTimeHours + durationHours;

    const screenCleanTime = 20;
    let endTimeMinutes = startTimeMinutes + durationMins + screenCleanTime;
    if (endTimeMinutes >= 60) {
      endTimeHours += Math.floor(endTimeMinutes / 60);
      endTimeMinutes = endTimeMinutes % 60;
    }

    if (endTimeHours >= 24) throw Error('Invalid start time - film ends after midnight');
    return [endTimeHours, endTimeMinutes];
  }

  getMovieDuration(movieName) {
    const movie = this.getMovie(movieName);
    if (!this.isTimeValid(movie.duration)) throw Error('Invalid duration');
    const durationHours = Number(movie.duration.split(':')[0]);
    const durationMins = Number(movie.duration.split(':')[1]);
    return [durationHours, durationMins];
  }

  checkMovieShowings(movieName, screenName, startTime) {
    const screen = this.getScreen(screenName);
    for (let i = 0; i < screen.showings.length; i++) {
      const showingStartTime = screen.showings[i].startTime;
      if (!this.isTimeValid(showingStartTime)) throw Error('Invalid start time');
      const startTimeHours = Number(showingStartTime.split(':')[0]);
      const startTimeMins = Number(showingStartTime.split(':')[1]);
      const endTime = screen.showings[i].endTime;
      if (!this.isTimeValid(endTime)) throw Error('Invalid end time');
      const endTimeHours = Number(endTime.split(':')[0]);
      const endTimeMins = Number(endTime.split(':')[1]);
      this.isOverlapping(
        movieName,
        startTime,
        startTimeHours,
        startTimeMins,
        endTimeHours,
        endTimeMins
      );
    }
  }

  isOverlapping(movieName, startTime, startTimeHours, startTimeMins, endTimeHours, endTimeMins) {
    const [intendedStartTimeHours, intendedStartTimeMinutes] = this.getShowingStartTime(startTime);
    const [intendedEndTimeHours, intendedEndTimeMinutes] = this.getShowingEndTime(
      movieName,
      startTime
    );
    const d1 = new Date();
    d1.setMilliseconds(0);
    d1.setSeconds(0);
    d1.setMinutes(intendedStartTimeMinutes);
    d1.setHours(intendedStartTimeHours);

    const d2 = new Date();
    d2.setMilliseconds(0);
    d2.setSeconds(0);
    d2.setMinutes(intendedEndTimeMinutes);
    d2.setHours(intendedEndTimeHours);

    const d3 = new Date();
    d3.setMilliseconds(0);
    d3.setSeconds(0);
    d3.setMinutes(startTimeMins);
    d3.setHours(startTimeHours);

    const d4 = new Date();
    d4.setMilliseconds(0);
    d4.setSeconds(0);
    d4.setMinutes(endTimeMins);
    d4.setHours(endTimeHours);

    if ((d1 > d3 && d1 < d4) || (d2 > d3 && d2 < d4) || (d1 < d3 && d2 > d4)) {
      throw Error('Time unavailable');
    }
  }

  addMovieShowing(movieName, screenName, startTime) {
    const movie = this.getMovie(movieName);
    const [intendedEndTimeHours, intendedEndTimeMinutes] = this.getShowingEndTime(
      movieName,
      startTime
    );
    const screen = this.getScreen(screenName);
    this.checkMovieShowings(movieName, screenName, startTime);
    screen.showings.push({
      film: movie,
      startTime: startTime,
      endTime: intendedEndTimeHours + ':' + intendedEndTimeMinutes,
    });
  }

  allShowings() {
    const movieShowings = {};
    this.screens.forEach((screen) => {
      screen.showings.forEach((showing) => {
        if (!movieShowings[showing.film.name]) movieShowings[showing.film.name] = [];
        movieShowings[showing.film.name].push(
          `${screen.name} ${showing.film.name} (${showing.film.rating}) ${showing.startTime} - ${showing.endTime}`
        );
      });
    });
    return movieShowings;
  }
}

module.exports = Cinema;
