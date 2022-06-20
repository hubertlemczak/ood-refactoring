class Cinema {
  constructor() {
    this.films = [];
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
  }

  isScreen(screenName) {
    let result = false;
    this.screens.forEach((screen) => {
      if (screen.name.includes(screenName)) result = true;
    });
    if (result || !screenName) throw Error('Screen already exists');
    return result;
  }

  isMovie(movieName) {
    let film = false;
    this.films.forEach((movie) => {
      if (movie.name.includes(movieName)) film = true;
    });
    if (film) throw Error('Film already exists');
    return film;
  }

  getMovie(movieName) {
    let film;
    this.films.forEach((movie) => {
      if (movie.name.includes(movieName)) film = movie;
    });
    if (!film) throw Error('Film does not exist');
    return film;
  }
  // Vague method name: addMovie()
  // Could be in new Movie class
  addMovie(movieName, rating, duration) {
    this.isMovie(movieName);
    // This can be another method: isMovieRatingValid()
    const movieRatings = ['U', 'PG', '12', '15', '18'];
    if (!movieRatings.includes(rating)) return 'Invalid rating';

    // This can be another method: isMovieDurationValid()
    const result = /^(\d?\d):(\d\d)$/.exec(duration);
    if (result == null) throw Error('Invalid duration');
    const hours = parseInt(result[1]);
    const mins = parseInt(result[2]);
    if (hours < 0 || (hours <= 0 && mins <= 0) || mins > 60) {
      throw Error('Invalid duration');
    }

    this.films.push({ name: movieName, rating, duration });
  }

  // Vague method name: addMovieScreening()
  //Add a showing for a specific film to a screen at the provided start time
  addMovieScreening(movieName, screenName, startTime) {
    // This can be another method: isStartTimeValid()
    let result = /^(\d?\d):(\d\d)$/.exec(startTime);
    if (result == null) throw Error('Invalid start time');

    const intendedStartTimeHours = parseInt(result[1]);
    const intendedStartTimeMinutes = parseInt(result[2]);
    if (
      intendedStartTimeHours < 0 ||
      (intendedStartTimeHours <= 0 && intendedStartTimeMinutes <= 0) ||
      intendedStartTimeMinutes > 60
    )
      throw Error('Invalid start time');

    const film = this.getMovie(movieName);

    //From duration, work out intended end time
    //if end time is over midnight, it's an error
    //Check duration
    result = /^(\d?\d):(\d\d)$/.exec(film.duration);
    if (result == null) throw Error('Invalid duration');

    const durationHours = parseInt(result[1]);
    const durationMins = parseInt(result[2]);

    //Add the running time to the duration
    let intendedEndTimeHours = intendedStartTimeHours + durationHours;

    //It takes 20 minutes to clean the screen so add on 20 minutes to the duration
    //when working out the end time
    let intendedEndTimeMinutes = intendedStartTimeMinutes + durationMins + 20;
    if (intendedEndTimeMinutes >= 60) {
      intendedEndTimeHours += Math.floor(intendedEndTimeMinutes / 60);
      intendedEndTimeMinutes = intendedEndTimeMinutes % 60;
    }

    if (intendedEndTimeHours >= 24) throw Error('Invalid start time - film ends after midnight');

    //Find the screen by name
    let theatre = null;
    for (let i = 0; i < this.screens.length; i++) {
      if (this.screens[i].name == screenName) {
        theatre = this.screens[i];
      }
    }

    if (theatre === null) throw Error('Invalid screen');

    //Go through all existing showings for this film and make
    //sure the start time does not overlap
    for (let i = 0; i < theatre.showings.length; i++) {
      //Get the start time in hours and minutes
      const startTime = theatre.showings[i].startTime;
      result = /^(\d?\d):(\d\d)$/.exec(startTime);
      if (result == null) throw Error('Invalid start time');

      const startTimeHours = parseInt(result[1]);
      const startTimeMins = parseInt(result[2]);
      if (startTimeHours <= 0 || startTimeMins > 60) throw Error('Invalid start time');

      //Get the end time in hours and minutes
      const endTime = theatre.showings[i].endTime;
      result = /^(\d?\d):(\d\d)$/.exec(endTime);
      if (result == null) throw Error('Invalid end time');

      const endTimeHours = parseInt(result[1]);
      const endTimeMins = parseInt(result[2]);
      if (endTimeHours <= 0 || endTimeMins > 60) throw Error('Invalid end time');

      //if intended start time is between start and end
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

    //Add the new start time and end time to the showing
    theatre.showings.push({
      film: film,
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
