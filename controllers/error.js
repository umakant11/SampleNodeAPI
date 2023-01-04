exports.get404 = (req, res, next) => {
    console.log("Page not found");
    res.render('404', {pageTitle:'Page not found.'});
};