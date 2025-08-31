$(document).ready(function() {
    // Get destination ID from URL parameter
    var urlParams = new URLSearchParams(window.location.search);
    var destinationId = urlParams.get('id');
    
    if (!destinationId) {
        showError('ID-ul destinatiei nu a fost specificat');
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
        alert('Functionalitatea de editare va fi implementata in viitor');
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

    // Image gallery click handler - use direct binding after images are loaded
    // This will be bound in displayImagesGallery function
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
                showError(result.message || 'Eroare la incarcarea destinatiei');
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
    $('#detail-descriere').text(destination.Descriere || 'Fara descriere disponibila');
    
    // Fill in pricing
    $('#detail-pret-adult').text(formatPrice(destination.PretAdult));
    $('#detail-pret-minor').text(formatPrice(destination.PretMinor));
    
    // Load images gallery
    displayImagesGallery(destination.Images || []);
    
    
    // Show content
    $('#destination-content').show();
}

function displayImagesGallery(images) {
    var gallery = $('#images-gallery');
    gallery.empty();
    
    if (!images || images.length === 0) {
        gallery.html('<p class="no-images">Nu sunt disponibile imagini pentru aceasta destinatie.</p>');
        return;
    }
    
    images.forEach(function(imageUrl, index) {
        var imageElement = $('<div class="gallery-item">' +
            '<img src="' + imageUrl + '" alt="Imagine destinatie ' + (index + 1) + '" class="gallery-image" data-url="' + imageUrl + '">' +
            '<div class="image-overlay">' +
                '<i class="fas fa-search-plus"></i>' +
            '</div>' +
        '</div>');
        
        // Bind click event to the entire gallery item (not just the image)
        imageElement.click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var imageUrl = $(this).find('.gallery-image').data('url');
            console.log('Gallery item clicked, URL:', imageUrl);
            showImageModal(imageUrl);
        });
        
        gallery.append(imageElement);
    });
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
    
    // Create modal for image viewing
    var modal = $('<div class="image-modal" style="display: none;">' +
        '<div class="modal-content">' +
            '<span class="close-modal">&times;</span>' +
            '<img src="' + imageUrl + '" alt="Imagine destinatie" class="modal-image">' +
        '</div>' +
    '</div>');
    
    $('body').append(modal);
    
    // Show modal with fade effect
    modal.fadeIn(300);
    
    console.log('Modal created and shown');
    
    // Close modal handlers
    modal.find('.close-modal').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked');
        modal.fadeOut(300, function() {
            modal.remove();
        });
    });
    
    modal.click(function(e) {
        if (e.target === this) {
            console.log('Background clicked');
            modal.fadeOut(300, function() {
                modal.remove();
            });
        }
    });
    
    // ESC key to close
    $(document).keyup(function(e) {
        if (e.keyCode === 27) { // ESC key
            modal.fadeOut(300, function() {
                modal.remove();
            });
            $(document).off('keyup'); // Remove this specific handler
        }
    });
}
