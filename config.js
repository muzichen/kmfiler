var path = require('path');

// variables

var base = path.resolve(__dirname);

// paths
var paths = {
    html : {
        src : base + '/*.html'
    },
    style : {
        src : base + '/src/sass/**/*.scss',
        dist : base + '/dist/css'
    },
    js : {
        src : base + '/src/js/**/*.js',
        dist : base + '/dist/js'
    },
    image : {
        src : base + '/src/images/**/*.+(png|jpg|gif|svg)',
        dist : base + '/dist/images'
    }
};

// options 

var sassOptions = {
    errLogToConsole : true,
    outputStyle : 'expanded'
};

var autoprefixerOptions = {
    browsers : ['last 2 versions', '> 5%', 'Firefox ESR']
};

var imageOptions = {
    
};


module.exports = {
    paths : paths,
    sassOptions : sassOptions,
    autoprefixerOptions : autoprefixerOptions
};