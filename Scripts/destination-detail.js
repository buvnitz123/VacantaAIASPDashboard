$(document).ready(function() {
    // Get destination ID from URL parameter
    var urlParams = new URLSearchParams(window.location.search);
    var destinationId = urlParams.get('id');
    
    if (!destinationId) {
        showError('ID-ul destinației nu a fost specificat');
        return;
    }

    // Load destination details
    loadDestinationDetails(destinationId);

    // Back button functionality
    $('#btn-back-to-destinations').click(function() {
        window.location.href = 'Index.aspx#destinatii';
    });

    // Edit button functionality
    $('#btn-edit-destination').click(function() {
        // TODO: Implement edit functionality
        alert('Funcționalitatea de editare va fi implementată în viitor');
    });

    // Handle sidebar navigation from detail page
    $(document).on('click', '.sidebar a[data-section]', function(e) {
        e.preventDefault();
        var section = $(this).data('section');
        window.location.href = 'Index.aspx#' + section;
    });

    // Handle navbar navigation from detail page
    $(document).on('click', '.topnav a', function(e) {
        var href = $(this).attr('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            window.location.href = 'Index.aspx' + href;
        }
    });
});

function loadDestinationDetails(destinationId) {
    console.log('Loading destination details for ID:', destinationId);
    
    $('#loading-indicator').show();
    $('#error-message').hide();
    $('#destination-content').hide();

    $.ajax({
        type: "POST",
        url: "DestinationDetail.aspx/GetDestinationDetails",
        data: JSON.stringify({ destinationId: parseInt(destinationId) }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            console.log('Destination details response:', response);
            $('#loading-indicator').hide();
            
            var result = JSON.parse(response.d);
            console.log('Parsed destination details:', result);
            
            if (result.success && result.destination) {
                displayDestinationDetails(result.destination);
            } else {
                showError(result.message || 'Eroare la încărcarea destinației');
            }
        },
        error: function(xhr, status, error) {
            console.log('AJAX error:', error);
            $('#loading-indicator').hide();
            showError('Eroare de comunicare cu serverul');
        }
    });
}

function displayDestinationDetails(destination) {
    console.log('Displaying destination:', destination);
    
    // Update page title
    $('#destination-title').text('Detalii: ' + destination.Denumire);
    document.title = 'Detalii: ' + destination.Denumire + ' - Dashboard';
    
    // Fill in basic information
    $('#detail-denumire').text(destination.Denumire || '-');
    $('#detail-tara').text(destination.Tara || '-');
    $('#detail-oras').text(destination.Oras || '-');
    $('#detail-regiune').text(destination.Regiune || '-');
    $('#detail-descriere').text(destination.Descriere || 'Fără descriere disponibilă');
    
    // Fill in pricing
    $('#detail-pret-adult').text(formatPrice(destination.PretAdult));
    $('#detail-pret-minor').text(formatPrice(destination.PretMinor));
    
    // Load images gallery - clear any existing images first
    displayImagesGallery(destination.Images || []);
    
    // Show content
    $('#destination-content').show();
}

function displayImagesGallery(images) {
    console.log('Displaying images gallery, image count:', images.length);
    
    var gallery = $('#images-gallery');
    
    // Clear existing content completely
    gallery.empty();
    
    // Remove any existing event handlers to prevent conflicts
    gallery.off('click', '.gallery-item');
    
    if (!images || images.length === 0) {
        gallery.html('<p class="no-images">Nu sunt disponibile imagini pentru această destinație.</p>');
        return;
    }
    
    images.forEach(function(imageUrl, index) {
        console.log('Processing image', index + 1, ':', imageUrl);
        
        // Create unique ID for each gallery item to avoid conflicts
        var uniqueId = 'gallery-item-' + Date.now() + '-' + index;
        
        var imageElement = $('<div class="gallery-item" id="' + uniqueId + '">' +
            '<img src="' + imageUrl + '" alt="Imagine destinație ' + (index + 1) + '" class="gallery-image" data-url="' + imageUrl + '" data-index="' + index + '">' +
            '<div class="image-overlay">' +
                '<i class="fas fa-search-plus"></i>' +
            '</div>' +
        '</div>');
        
        // Add error handling for images that fail to load
        imageElement.find('.gallery-image').on('error', function() {
            console.log('Image failed to load:', imageUrl);
            $(this).parent().html('<div class="image-error">Imaginea nu a putut fi încărcată</div>');
        });
        
        gallery.append(imageElement);
    });
    
    // Bind click events using event delegation after all images are added
    gallery.on('click', '.gallery-item', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var imageUrl = $(this).find('.gallery-image').data('url');
        console.log('Gallery item clicked, URL:', imageUrl);
        
        if (imageUrl) {
            showImageModal(imageUrl);
        }
    });
    
    console.log('Gallery setup complete, items added:', images.length);
}

function formatPrice(price) {
    if (!price || price === 0) {
        return 'Gratuit';
    }
    return price.toFixed(2) + ' €';
}

function showError(message) {
    $('#error-text').text(message);
    $('#error-message').show();
    $('#loading-indicator').hide();
    $('#destination-content').hide();
}

function showImageModal(imageUrl) {
    console.log('showImageModal called with URL:', imageUrl);
    
    // Remove any existing modals first
    $('.image-modal').remove();
    
    // Create modal for image viewing with unique ID
    var modalId = 'image-modal-' + Date.now();
    var modal = $('<div class="image-modal" id="' + modalId + '" style="display: none;">' +
        '<div class="modal-content">' +
            '<span class="close-modal">&times;</span>' +
            '<img src="' + imageUrl + '" alt="Imagine destinație" class="modal-image">' +
        '</div>' +
    '</div>');
    
    $('body').append(modal);
    
    // Show modal with fade effect
    modal.fadeIn(300);
    
    console.log('Modal created and shown with ID:', modalId);
    
    // Close modal handlers
    modal.find('.close-modal').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked');
        modal.fadeOut(300, function() {
            modal.remove();
        });
    });
    
    modal.on('click', function(e) {
        if (e.target === this) {
            console.log('Background clicked');
            modal.fadeOut(300, function() {
                modal.remove();
            });
        }
    });
    
    // ESC key to close - bind to document but remove after modal is closed
    var escHandler = function(e) {
        if (e.keyCode === 27) { // ESC key
            modal.fadeOut(300, function() {
                modal.remove();
            });
            $(document).off('keyup', escHandler);
        }
    };
    
    $(document).on('keyup', escHandler);
    
    // Auto-remove handler when modal is removed
    modal.on('remove', function() {
        $(document).off('keyup', escHandler);
    });
}
