handlers.getGuest= function (ctx) {
    ctx.isLogged = auth.isAuth();
    if (ctx.isLogged) {
        ctx.redirect('#/catalog');
    } else {
        ctx.loadPartials({
            footer: './templates/footer.hbs',
        }).then(function () {
            this.partial('./templates/guest.hbs')
        })
    }
}