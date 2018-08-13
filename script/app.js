$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');
        this.get('index.html', getGuest)
        this.get('#/home', getGuest)

        this.get('#/login', getLogin)
        this.get('#/register', getRegister)

        this.post('#/register', postRegister)
        this.post('#/login', postLogin)
        this.get('#/logout', getLogout)

        this.get('#/catalog', getCatalog)

        this.get('#/create', getCreate)
        this.post('#/create', postCreate)

        this.get('#/delete/:id', getDelete)

        this.get('#/myListings', getMyListings)
        this.get('#/details/:id', getDetails)

        this.get('#/edit/:id', getEdit)
        this.post('#/edit', postEdit)

        function postEdit(ctx) {
            ctx.username = sessionStorage.getItem('username');
            ctx.userid = sessionStorage.getItem('userid');
            ctx.authtoken = sessionStorage.getItem('authtoken');
            ctx.isAuth = auth.isAuth();

            let listing = {
                brand: ctx.params.brand,
                description: ctx.params.description,
                fuel: ctx.params.fuelType,
                imageUrl: ctx.params.imageUrl,
                model: ctx.params.model,
                price: ctx.params.price,
                title: ctx.params.title,
                year: ctx.params.year,
                seller: ctx.username
            }

            if (isValidListing(listing)) {
                kinvey.updateEntity('cars', ctx.params.carId, listing)
                    .then(function () {
                        notify.showInfo(`Listing ${listing.title} updated.`)
                        ctx.redirect('#/catalog');
                    })
                    .catch(notify.handleError)
            }
        }

        function getEdit(ctx) {
            ctx.username = sessionStorage.getItem('username');
            ctx.userid = sessionStorage.getItem('userid');
            ctx.authtoken = sessionStorage.getItem('authtoken');
            ctx.isAuth = auth.isAuth();

            kinvey.getEntityById('cars', ctx.params.id)
                .then(function (listing) {
                    ctx.listing = listing;
                    ctx.loadPartials({
                        navigation: './templates/navigation.hbs',
                        footer: './templates/footer.hbs',
                    }).then(function () {
                        this.partial('./templates/edit.hbs')
                    })
                })
        }

        function getDetails(ctx) {
            ctx.username = sessionStorage.getItem('username');
            ctx.userid = sessionStorage.getItem('userid');
            ctx.authtoken = sessionStorage.getItem('authtoken');
            ctx.isAuth = auth.isAuth();

            kinvey.getEntityById('cars', ctx.params.id)
                .then(function (listing) {
                    if (listing._acl.creator === ctx.userid) {
                        listing.isAuthor = true;
                    }
                    ctx.listing = listing;
                    ctx.loadPartials({
                        navigation: './templates/navigation.hbs',
                        footer: './templates/footer.hbs',
                    }).then(function () {
                        this.partial('./templates/details.hbs')
                    })

                }).catch(notify.handleError)

        }

        function getMyListings(ctx) {
            ctx.username = sessionStorage.getItem('username');
            ctx.userid = sessionStorage.getItem('userid');
            ctx.authtoken = sessionStorage.getItem('authtoken');
            ctx.isAuth = auth.isAuth();
            let queryObj = JSON.stringify({seller: ctx.username});
            kinvey.getEntitiesFiltered('cars', 'seller', ctx.username)
                .then(
                    function (listings) {
                        console.log(listings);
                        for (let listing of listings) {
                            if (listing.seller === ctx.username) {
                                listing.isAuthor = true;
                                console.log('author!');
                            }
                        }
                        ctx.listings = listings;
                        ctx.loadPartials({
                            navigation: './templates/navigation.hbs',
                            footer: './templates/footer.hbs',
                            myListing: './templates/myListing.hbs',
                        }).then(function () {
                            this.partial('./templates/myListings.hbs')
                        })
                    }
                ).catch(notify.handleError)

        }

        function getDelete(ctx) {
            kinvey.deleteEntity('cars', ctx.params.id)
                .then(function () {
                    notify.showInfo('Listing deleted.');
                    ctx.redirect('#/catalog')
                })
                .catch(notify.handleError)
        }

        function postCreate(ctx) {
            ctx.username = sessionStorage.getItem('username');
            ctx.userid = sessionStorage.getItem('userid');
            ctx.authtoken = sessionStorage.getItem('authtoken');
            ctx.isAuth = auth.isAuth();

            let listing = {};
            listing.brand = ctx.params.brand;
            listing.description = ctx.params.description;
            listing.fuel = ctx.params.fuelType;
            listing.imageUrl = ctx.params.imageUrl;
            listing.model = ctx.params.model;
            listing.price = ctx.params.price;
            listing.title = ctx.params.title;
            listing.year = ctx.params.year;
            listing.seller = ctx.username;

            console.log(ctx.params);

            if (isValidListing(listing)) {
                let btnCreate = $('.registerbtn');
                btnCreate.attr("disabled", "disabled");
                setTimeout(function () {
                    btnCreate.removeAttr('disabled');
                }, 1000);
                kinvey.createEntity('cars', listing)
                    .then(function () {
                        notify.showInfo('listing created.')
                        ctx.redirect("#/catalog")


                    }).catch(function (err) {
                    notify.handleError(err);
                })
            }
        }

        function getCreate(ctx) {
            ctx.username = sessionStorage.getItem('username');
            ctx.userid = sessionStorage.getItem('userid');
            ctx.authtoken = sessionStorage.getItem('authtoken');
            ctx.isAuth = auth.isAuth();

            if (!ctx.isAuth) {
                ctx.redirect('#/home');
            } else {
                ctx.loadPartials({
                    navigation: './templates/navigation.hbs',
                    footer: './templates/footer.hbs',
                }).then(function () {
                    this.partial('./templates/create.hbs')
                })
            }
        }

        function getCatalog(ctx) {
            ctx.username = sessionStorage.getItem('username');
            ctx.userid = sessionStorage.getItem('userid');
            ctx.authtoken = sessionStorage.getItem('authtoken');
            ctx.isAuth = auth.isAuth();

            kinvey.getAllEntities('cars', '?query={}&sort={"_kmd.ect": -1}')
                .then(
                    function (listings) {
                        console.log(listings);
                        for (let listing of listings) {
                            if (listing._acl.creator === ctx.userid) {
                                listing.isAuthor = true;
                                console.log('author!');
                            }
                        }
                        ctx.listings = listings;
                        ctx.loadPartials({
                            navigation: './templates/navigation.hbs',
                            footer: './templates/footer.hbs',
                            listing: './templates/listing.hbs',
                        }).then(function () {
                            this.partial('./templates/catalog.hbs')
                        })
                    }
                ).catch(notify.handleError)
        }

        function getLogin(ctx) {
            ctx.isAuth = auth.isAuth();
            if (ctx.isAuth) {
                ctx.redirect('#/catalog');
            } else {
                ctx.loadPartials({
                    navigation: './templates/navigation.hbs',
                    footer: './templates/footer.hbs',
                }).then(function () {
                    this.partial('./templates/login.hbs')
                })
            }
        }

        function getRegister(ctx) {
            ctx.isAuth = auth.isAuth();
            if (ctx.isAuth) {
                ctx.redirect('#/catalog');
            } else {
                ctx.loadPartials({
                    navigation: './templates/navigation.hbs',
                    footer: './templates/footer.hbs',
                }).then(function () {
                    this.partial('./templates/register.hbs')
                })
            }
        }

        function getGuest(ctx) {
            ctx.isAuth = auth.isAuth();
            if (ctx.isAuth) {
                ctx.redirect('#/catalog');
            } else {

                ctx.loadPartials({
                    navigation: './templates/navigation.hbs',
                    footer: './templates/footer.hbs',
                }).then(function () {
                    this.partial('./templates/guest.hbs')
                })
            }
        }

        // LOGIN
        function postLogin(ctx) {
            username = ctx.params.username;
            password = ctx.params.password;
            if (isValid(username, password)) {
                auth.login(username, password)
                    .then(function (userData) {
                        auth.saveSession(userData);
                        ctx.isLogged = auth.isAuth();
                        notify.showInfo('Login successful.');
                        ctx.redirect('#/catalog');
                    }).catch(notify.handleError);
            }
        }

        //REGISTER
        function postRegister(ctx) {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let repeatPass = ctx.params.repeatPass;

            if (username === '') {
                notify.showError('Username can not be blank!');
            }
            else  if (password === '' || repeatPass ===''){
                notify.showError('Password can not be blank!');
            }
            if (isValid(username, password, repeatPass)) {
                let btnRegister = $('.registerbtn');
                btnRegister.attr("disabled", "disabled");
                setTimeout(function () {
                    btnCreate.removeAttr('disabled');
                }, 1000);
                auth.register(username, password)
                    .then(function (userData) {
                        auth.saveSession(userData);
                        notify.showInfo('User registration successful.')
                        ctx.redirect('#/catalog')
                    }).catch(notify.handleError);
            }
        }

        //LOGOUT
        function getLogout(ctx) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    notify.showInfo('Logout successful.');
                    ctx.redirect('#/home');
                }).catch(notify.handleError);
        }

        function isValidListing(listing) {
            if (listing.title === '' || listing.description === '' || listing.brand === ''
                || listing.fuel === '' || listing.model === '' || listing.year === ''
                || listing.price === '') {
                notify.showError('Fields can not be empty!');
                return false;
            } else if (listing.title === '' || listing.title.length > 33) {
                notify.showError('The title length must not exceed 33 characters!');
                return false;
            } else if (listing.description.length > 450 || listing.description.length < 30) {
                notify.showError('The description length must not exceed 450 characters and should be at least 30!');
                return false;
            } else if (listing.brand.length > 11) {
                notify.showError('The brand length must not exceed 11 characters!');
                return false;
            } else if (listing.fuel.length > 11) {
                notify.showError('The fuel type length must not exceed 11 characters!');
                return false;
            } else if (listing.model.length > 11 || listing.model.length < 4) {
                notify.showError('The model length must not exceed 11 characters and should be at least 4!');
                return false;
            } else if (listing.year.length !== 4) {
                notify.showError('The year must be only 4 chars long!');
                return false;
            } else if (Number(listing.price) > 1000000) {
                notify.showError('The maximum price is 1000000$');
                return false;
            } else if (!listing.imageUrl.startsWith('http')) {
                notify.showError('Link url should always start with "http".');
                return false;
            }

            return true;
        }

        function isValid(username, password, repeatPass) {
            let userPattern = /^[A-Za-z]{3,}$/;
            let passPattern = /^[A-Za-z0-9]{6,}/;
            if (!username.match(userPattern)) {
                notify.showError('Username should be at least 3 english letters!');
                return false;
            } else if (repeatPass && password !== repeatPass) {
                notify.showError('Passwords do not match!');
                return false;
            } else if (!password.match(passPattern)) {
                notify.showError('Password should be at least 6 english letters/digits!');
                return false;
            }

            return true;
        }

    })
    app.run();
})